export const dynamic = "force-dynamic";
import EmptyState from '@/components/EmptyState'
import Header from '@/components/Header'
import VideoCard from '@/components/VideoCard'
import { dummyCards } from '@/constants'
import { getAllVideos } from '@/lib/hooks/actions/video'
import React from 'react'

const page = async({searchParams}:SearchParams) => {
 const {query,filter,page} =await searchParams;
 const {videos,pagination}=await getAllVideos(query,filter,Number(page) || 1);
  return (
   <main className='wrapper page'>
    <Header title="All Videos" subHeader="Public Library"/>
    {videos.length> 0 ? (
 <section className='video-grid'>
   
      {videos.map(({video,user})=>(
     
    <VideoCard key={video.id} {...video} thumbnail={video.thumbnailUrl} userImg={user?.image || ''} username={user?.name || "Guest"}/>
  ))} 
  </section>
  
    ) :<EmptyState icon="/assets/icons/video.svg" title="No videos found" description="Try adjucting your search"/>}
  
   </main>
  )
}

export default page