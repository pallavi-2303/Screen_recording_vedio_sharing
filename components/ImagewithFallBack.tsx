"use client"
import React, { useEffect, useState } from 'react'
import Image from "next/image";
const ImagewithFallBack = ({
  fallback = "/assets/images/dummy.jpg",
  alt,
  src,
  ...props  
}:ImageWithFallbackProps) => {
const [error,setError]=useState<boolean|null>(null);
const [imgSrc, setImgSrc] = useState<string>(src || fallback);
useEffect(()=>{
   setError(null);
    setImgSrc(src || fallback);
},[src,fallback])
  return (
      <Image
      alt={alt}
      onError={() => setError(true)}
      src={error ? fallback : imgSrc}
      {...props}
    />
  )
}

export default ImagewithFallBack