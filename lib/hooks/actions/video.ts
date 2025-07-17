"use server";

import { auth } from "@/lib/auth";
import {
  apiFetch,
  doesTitleMatch,
  getEnv,
  withErrorHandling,
  getOrderByClause,
  extractCloudinaryPublicId,
} from "../util";
import { headers } from "next/headers";
import { BUNNY } from "@/constants";
import { db } from "@/drizzle/db";
import { user, videos } from "@/drizzle/schema";
import { revalidatePath } from "next/cache";
import aj from "@/lib/arcjet";
import { fixedWindow, request } from "@arcjet/next";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

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
const buildVideoWithUserQuery = () => {
  return db
    .select({
      video: videos,
      user: { id: user.id, name: user.name, image: user.image },
    })
    .from(videos)
    .leftJoin(user, eq(videos.userId, user.id));
};

export const getVideoUploadUrl = withErrorHandling(async () => { 
  const userId = "dev-user-id"; 
 const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${Date.now()}-video`;
  const folder = "videos";
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      public_id: publicId,
      folder,
    },
    process.env.CLOUDINARY_API_SECRET!
  );
  const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`;
  return {
    videoId: publicId,
    uploadUrl,
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
    
  };
});
export const getThumbnailUploadUrl=withErrorHandling(
  async(videoId:string)=>{
    const timestamp = Math.floor(Date.now());
    const publicId = `${Date.now()}-${videoId}-thumbnail`;
    const folder = "thumbnails"; 
 const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        public_id: publicId,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    );  
    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
    const cdnUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${folder}/${publicId}`;
  return {
      uploadUrl,   
      cdnUrl,       
      publicId,     
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      folder,
      
    };
  }
)
export const saveVideoDetails = withErrorHandling(
  async (videoDetails: VideoDetails) => {
     const userId = await getSessionUserId();
    await validateWithArcjet(userId);
    await db.insert(videos).values({
      ...videoDetails,
      videoUrl:videoDetails.videoUrl,
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
export const getVideoById = withErrorHandling(async (videoId: string) => {
  const [videoRecord] = await buildVideoWithUserQuery().where(
    eq(videos.videoId, videoId)
  );

  return videoRecord;
});
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
    try {
      const resource = await cloudinary.api.resource(videoId, {
        resource_type: "video",
      });
      return {
        isProcessed: true, // Cloudinary processes almost instantly
        encodingProgress: 100, // No progressive encoding feedback
        status: "ready",
        duration: resource.duration,
        format: resource.format,
        width: resource.width,
        height: resource.height,
      };
    }
catch (error: any) {
      if (error?.http_code === 404) {
        return {
          isProcessed: false,
          encodingProgress: 0,
          status: "not_found",
        };
      }
      throw new Error("Failed to fetch video status");
    }
  }
);
export const deleteVideo = withErrorHandling(
  async (videoId: string, thumbnailUrl: string) => {
   await cloudinary.uploader.destroy(videoId,{
    resource_type:"video",
   });
 const thumbnailPublicId=extractCloudinaryPublicId(thumbnailUrl); 
  if (thumbnailPublicId) {
      await cloudinary.uploader.destroy(thumbnailPublicId, {
        resource_type: "image",
      });
    }
    const result = await db.delete(videos).where(eq(videos.videoId, videoId));
    revalidatePaths(["/", `/video/${videoId}`]);
    return {};
  }
);
export const updateVideoVisibility = withErrorHandling(
  async (videoId: string, visibility: Visibility) => {
    await validateWithArcjet(videoId);
    await db
      .update(videos)
      .set({ visibility, updatedAt: new Date() })
      .where(eq(videos.id, videoId));
    return {};
  }
);
export const getTranscript = withErrorHandling(async (videoId: string) => {
  const response = await fetch(
    `${BUNNY.TRANSCRIPT_URL}/${videoId}/captions/en-auto.vtt`
  );

  return response.text();
});
export const incrementVideoViews = withErrorHandling(
  async (videoId: string) => {
    await db
      .update(videos)
      .set({ views: sql`${videos.views} + 1`, updatedAt: new Date() })
      .where(eq(videos.videoId, videoId));
    revalidatePaths([`/video/${videoId}`]);
    return {};
  }
);
