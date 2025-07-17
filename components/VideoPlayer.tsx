import { createIframeLink } from '@/lib/hooks/util'
import React from 'react'

const VideoPlayer = ({videoId,videoUrl}:VideoPlayerProps) => {
   if (!videoUrl) {
    return (
      <div className="video-player text-center text-red-500">
        Video not available
      </div>
    );
  }
  return (
    <div className='video-player'>
     <video
        src={videoUrl}
        controls
        preload="auto"
        className="w-full h-full rounded-lg"
      >
        Your browser does not support the video tag.
      </video>
   </div>
  )
}

export default VideoPlayer