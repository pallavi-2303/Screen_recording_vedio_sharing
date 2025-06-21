"use server";

import { auth } from "@/lib/auth";
import { apiFetch, doesTitleMatch, getEnv, withErrorHandling,getOrderByClause} from "../util";
import { headers } from "next/headers";
import { BUNNY } from "@/constants";
import { db } from "@/drizzle/db";
import { user, videos } from "@/drizzle/schema";
import { revalidatePath } from "next/cache";
import aj from "@/lib/arcjet";
import { fixedWindow, request } from "@arcjet/next";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { PgSelectBase, PgSelectBuilder } from "drizzle-orm/pg-core";
const VIDEO_STREAM_BASE_URL = BUNNY.STREAM_BASE_URL;
const THUMBNAIL_STORAGE_BASE_URL = BUNNY.STORAGE_BASE_URL;
const THUMBNAIL_CDN_URL = BUNNY.CDN_URL;
const BUNNY_LIBRARY_ID = getEnv("BUNNY_LIBRARY_ID");
const ACCESS_KEYS = {
  streamAccessKey: getEnv("BUNNY_STREAM_ACCESS_KEY"),
  storageAccessKey: getEnv("BUNNY_STORAGE_ACCESS_KEY"),
};
//Helper Function
const getSessionUserId = async (): Promise<string> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorised");
  return session.user.id;
};
const revalidatePaths = (paths: string[]) => {
  paths.forEach((path) => revalidatePath(path));
};
const validateWithArcjet = async (fingerprint: string) => {
  const rateLimit = aj.withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 2,
      characteristics: ["fingerprint"],
    })
  );
  const req = await request();
  const decision = await rateLimit.protect(req, { fingerprint });
  if (decision.isDenied()) {
    throw new Error("Rate Limit Exceeded");
  }
};
const buildVideoWithUserQuery=()=>{
  console.log(videos)
    return db.select({
        video:videos,
        user:{id:user.id,name:user.name,image:user.image},
    }).from(videos).leftJoin(user,eq(videos.userId,user.id))
}
//Server Actions
export const getVideoUploadUrl = withErrorHandling(async () => {
  await getSessionUserId();
  const videoResponse = await apiFetch<BunnyVideoResponse>(
    `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos`,
    {
      method: "POST",
      bunnyType: "stream",
      body: { title: "Temporary Title", collectionId: "" },
    }
  );

  const uploadUrl = `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoResponse.guid}`;
  return {
    videoId: videoResponse.guid,
    uploadUrl,
    accessKey: ACCESS_KEYS.streamAccessKey,
  };
});

export const getThumbnailUploadUrl = withErrorHandling(
  async (videoId: string) => {
    const fileName = `${Date.now()}-${videoId}-thumbnail}`;
    const uploadUrl = `${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${fileName}`;
    const cdnUrl = `${THUMBNAIL_CDN_URL}/thumbnails/${fileName}`;
    return {
      uploadUrl,
      cdnUrl,
      fileName,
      accessKey: ACCESS_KEYS.storageAccessKey,
    };
  }
);
//saving in data base
export const saveVideoDetails = withErrorHandling(
  async (videoDetails: VideoDetails) => {
    const userId = await getSessionUserId();
    await validateWithArcjet(userId);
    await apiFetch(
      `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoDetails.videoId}`,
      {
        method: "POST",
        bunnyType: "stream",
        body: {
          title: "videoDetails.title",
          description: "videoDetails.description",
        },
      }
    );
    await db.insert(videos).values({
      ...videoDetails,
      videoUrl: `${BUNNY.EMBED_URL}/${BUNNY_LIBRARY_ID}/${videoDetails.videoId}`,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    revalidatePaths(["/"]);
    return { videoId: videoDetails.videoId };
  }
);
export const getAllVideos = withErrorHandling(
  async (
    searchQuery: string = "",
    sortFilter?: string,
    pageNumber: number = 1,
    pageSize: number = 8
  ) => {
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user.id;
    const canSeeTheVideos = or(
      eq(videos.visibility, "public"),
      eq(videos.userId, currentUserId!)
    );
    const whereCondition = searchQuery.trim()
      ? and(canSeeTheVideos, doesTitleMatch(videos, searchQuery))
      : canSeeTheVideos;

    const [{ totalCount }] = await db
      .select({ totalCount: sql<number>`count(*)` })
      .from(videos)
      .where(whereCondition);
    const totalVideos = Number(totalCount || 0);
    const totalPages = Math.ceil(totalVideos / pageSize);
    //Fetche paginated sorted result
    const videoRecords = await buildVideoWithUserQuery()
      .where(whereCondition)
      .orderBy(
        sortFilter
          ? getOrderByClause(sortFilter)
          : sql`${videos.createdAt} DESC`
      )
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);
      
    return {
      videos: videoRecords,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalVideos,
        pageSize,
      },
    };
  }
);
export const getVideoById=withErrorHandling(async(videoId:string)=>{
   
  
 const [videoRecord]=await buildVideoWithUserQuery().where(eq(videos.id,videoId)) 
  
  return videoRecord;
})
export const getAllVideosByUser = withErrorHandling(
  async (
    userIdParameter: string,
    searchQuery: string = "",
    sortFilter?: string
  ) => {
    const currentUserId = (
      await auth.api.getSession({ headers: await headers() })
    )?.user.id;
    const isOwner = userIdParameter === currentUserId;

    const [userInfo] = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, userIdParameter));
    if (!userInfo) throw new Error("User not found");

    const conditions = [
      eq(videos.userId, userIdParameter),
      !isOwner && eq(videos.visibility, "public"),
      searchQuery.trim() && ilike(videos.title, `%${searchQuery}%`),
    ].filter(Boolean) as any[];

    const userVideos = await buildVideoWithUserQuery()
      .where(and(...conditions))
      .orderBy(
        sortFilter ? getOrderByClause(sortFilter) : desc(videos.createdAt)
      );

    return { user: userInfo, videos: userVideos, count: userVideos.length };
  }
);
export const getVideoProcessingStatus = withErrorHandling(
  async (videoId: string) => {
    const processingInfo = await apiFetch<BunnyVideoResponse>(
      `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      { bunnyType: "stream" }
    );

    return {
      isProcessed: processingInfo.status === 4,
      encodingProgress: processingInfo.encodeProgress || 0,
      status: processingInfo.status,
    };
  }
);
export const deleteVideo=withErrorHandling(async(videoId:string,thumbnailUrl:string)=>{
   console.log("💥 Trying to delete video from Bunny:", videoId);

  await apiFetch(
    `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {method:"DELETE",bunnyType:"stream"}
  );
  const thumbnailPath=thumbnailUrl.split("thumbnails/")[1];
  await apiFetch(
    `${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${thumbnailPath}`,
    {method:"DELETE", bunnyType:"storage",expectJson:false}
  );
   const result = await db.delete(videos).where(eq(videos.videoId,videoId));
   console.log("Coming from fronted",videoId);
   console.log("Backend vedo id",videos.videoId);
 console.log("🗑️ DB DELETE RESULT:", result);
   revalidatePaths(["/", `/video/${videoId}`]);
    return {};
});
export const updateVideoVisibility=withErrorHandling(
  async(videoId: string, visibility: Visibility)=>{
   await validateWithArcjet(videoId);
   await db.update(videos).set({visibility,updatedAt:new Date()}).where(eq(videos.id,videoId));
   return {};
  }
)
