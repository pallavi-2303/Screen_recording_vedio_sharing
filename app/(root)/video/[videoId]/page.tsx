import VideoDetailHeader from "@/components/VideoDetailHeader";
import VideoInfo from "@/components/VideoInfo";
import VideoPlayer from "@/components/VideoPlayer";
import { getTranscript, getVideoById } from "@/lib/hooks/actions/video";
import { redirect } from "next/navigation";
import React from "react";

const page = async ({ params }: Params) => {

  const { videoId } = await params;
 
  const { user, video } = await getVideoById(videoId);
  const transcript = await getTranscript(videoId);
 console.log(video);
 console.log("videoUrl",video?.videoUrl);
  if (!video) redirect("/");
  return (
    <main className="wrapper page">
      <VideoDetailHeader
        {...video}
        userImg={user?.image}
        username={user?.name}
        ownerId={video.userId}
      />
      <section className="video-details">
        <div className="content">
          {" "}
          <VideoPlayer videoId={video?.videoId} videoUrl={video?.videoUrl} />
        </div>
        <VideoInfo transcript={transcript}
        title={video.title}
         createdAt={video.createdAt}
          description={video.description}
          videoId={videoId}
          videoUrl={video.videoUrl}/>
      </section>
    </main>
  );
};

export default page;
