import VideoDetailHeader from '@/components/VideoDetailHeader';
import VideoPlayer from '@/components/VideoPlayer';
import { getVideoById } from '@/lib/hooks/actions/video';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async({params}:Params) => {
  console.log("params:", params); 
  const { videoId } = await params; 
  console.log("videoId:", videoId);
  const {user,video}=await getVideoById(videoId);
   console.log(video);
  if(!video) redirect('/')
  return (
   <main className='wrapper page'>
     <VideoDetailHeader {...video} userImg={user?.image} username={user?.name} ownerId={video.userId} />
    <section className='video-details'>
<div className='content'> <VideoPlayer videoId={video?.videoId}/></div>
    </section> 
    
   </main>
  )
}

export default page