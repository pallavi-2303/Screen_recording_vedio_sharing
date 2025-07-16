"use client";
import FormField from "@/components/FormField";
import InputField from "@/components/InputField";
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";
import {
  getThumbnailUploadUrl,
  getVideoUploadUrl,
  saveVideoDetails,
} from "@/lib/hooks/actions/video";
import { useFileInput } from "@/lib/hooks/useFileInput";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
const uploadFileToBunny = (
  file: File,
  uploadUrl: string,
  accessKey: string
): Promise<void> => {
  return fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      AccessKey: accessKey,
    },
    body: file,
  }).then((response) => {
    if (!response.ok) throw new Error("Upload Fail");
  });
};

const page = () => {
  const router = useRouter();
  const video = useFileInput(MAX_VIDEO_SIZE);
  const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  useEffect(() => {
    if (video.duration !== null || 0) {
      setVideoDuration(video.duration!);
    }
  }, [video.duration]);
  useEffect(() => {
    const checkForRecordedVideo = async () => {
      try {
        const stored = sessionStorage.getItem("recordedVideo");
        if (!stored) return;
        const { url, name, type, duration } = JSON.parse(stored);
        const blob = await fetch(url).then((res) => res.blob());
        const file = new File([blob], name, { type, lastModified: Date.now() });
        if (video.inputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          video.inputRef.current.files = dataTransfer.files;
          const event = new Event("change", { bubbles: true });
          video.inputRef.current.dispatchEvent(event);
          video.handleFileChange({
            target: { files: dataTransfer.files },
          } as ChangeEvent<HTMLInputElement>);
        }
        if (duration) setVideoDuration(duration);
        sessionStorage.removeItem("recordedVideo");
        URL.revokeObjectURL(url);
      } catch (error) {
        console.log(error, "Error Recording Video");
      }
    };
    checkForRecordedVideo();
  }, [video]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public",
  });
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };
  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
  //   try {
  //     if (!video.file || !thumbnail.file) {
  //       setError("Please upload vedio and thumbnail");
  //       return;
  //     }
  //     if (!formData.description || !formData.title) {
  //       setError("Please fill in all the details");
  //       return;
  //     }
  //     //upload vedio to bunny
  //     const {
  //       videoId,
  //       uploadUrl: videoUploadUrl,
  //       accessKey: videoAccessKey,
  //     } = await getVideoUploadUrl();
  //     if(!videoUploadUrl || !videoAccessKey) throw new Error("Failed to get video upload credentials")
  //       await uploadFileToBunny(video.file,videoUploadUrl,videoAccessKey)

  //     //UPLOAD THUMBNIAL
  //      const {

  //       uploadUrl: thumbnailUploadUrl,
  //       accessKey: thumbnailAccessKey,
  //       cdnUrl:thumbnailCdnUrl
  //     } = await getThumbnailUploadUrl(videoId);
  //       if(!thumbnailUploadUrl || !thumbnailAccessKey || !thumbnailCdnUrl) throw new Error("Failed to get thumbnail upload credentials")
  //        await uploadFileToBunny(thumbnail.file,thumbnailUploadUrl,thumbnailAccessKey) ;
  //       await saveVideoDetails({
  //         videoId,
  //         thumbnailUrl:thumbnailCdnUrl,
  //         ...formData,
  //         duration:videoDuration
  //       })
  //       router.push(`/`);
  //   } catch (error) {
  //     console.log("Error submitting form", error);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!video.file || !thumbnail.file) {
        setError("Please upload a video and a thumbnail");
        return;
      }
      if (!formData.description || !formData.title) {
        setError("Please fill in all the details");
        return;
      }
      const {
        videoId,
        uploadUrl: videoUploadUrl,
        signature: videoSignature,
        timestamp: videoTimestamp,
        apiKey: videoApiKey,
        folder: videoFolder,
      } = await fetch("/api/videoUploadUrl").then((res) => res.json());

      console.log("Video Upload Data:", {
        videoId,
        videoUploadUrl,
        videoSignature,
        videoTimestamp,
        videoApiKey,
        videoFolder,
      });
      if (
        !videoUploadUrl ||
        !videoSignature ||
        !videoTimestamp ||
        !videoApiKey ||
        !videoFolder
      ) {
        throw new Error("Missing video upload credentials");
      }

      const videoFormData = new FormData();
      videoFormData.append("upload_preset", "signed_video_upload"); // or pass dynamic one from API response

      videoFormData.append("file", video.file);
      videoFormData.append("public_id", videoId);
      videoFormData.append("folder", videoFolder);
      videoFormData.append("timestamp", videoTimestamp.toString());
      videoFormData.append("signature", videoSignature);
      videoFormData.append("api_key", videoApiKey);
      const videoRes = await fetch(videoUploadUrl, {
        method: "POST",
        body: videoFormData,
      });
      if (!videoRes.ok) throw new Error("Video upload failed");
      const videoData = await videoRes.json();
      const videoUrl = videoData.secure_url;
      const {
        uploadUrl: thumbnailUploadUrl,
        signature: thumbnailSignature,
        timestamp: thumbnailTimestamp,
        apiKey: thumbnailApiKey,
        cdnUrl: thumbnailCdnUrl,
        publicId: thumbnailPublicId,
        folder: thumbnailFolder,
      } = await fetch(`/api/thumbnail?videoId=${videoId}`).then((res) =>
        res.json()
      );

      const thumbnailFormData = new FormData();
      thumbnailFormData.append("upload_preset", "signed_thumbnail_upload");
      thumbnailFormData.append("file", thumbnail.file!);
      thumbnailFormData.append("public_id", thumbnailPublicId);
      thumbnailFormData.append("folder", thumbnailFolder);
      thumbnailFormData.append("timestamp", thumbnailTimestamp.toString());
      thumbnailFormData.append("signature", thumbnailSignature);
      thumbnailFormData.append("api_key", thumbnailApiKey);
      const thumbRes = await fetch(thumbnailUploadUrl, {
        method: "POST",
        body: thumbnailFormData,
      });
      if (!thumbRes.ok) throw new Error("Thumbnail upload failed");
      await saveVideoDetails({
        videoId,
        videoUrl,
        thumbnailUrl: thumbnailCdnUrl,
        ...formData,
        duration: videoDuration,
      });
      router.push(`/`);
    } catch (error) {
      console.error("Error submitting form", error);
      setError("Something went wrong during upload.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="wrapper-md upload-page">
      <h1>Upload a video</h1>
      {error && <div className="error-field">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="rounded-20 shadow-10 gap-6 w-full flex flex-col px-5 py-7.5"
      >
        <FormField
          id="title"
          as="input"
          label="Title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter a clear and concise video title"
        />
        <FormField
          id="description"
          as="textarea"
          label="Description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter a description for your Vedio"
        />
        <InputField
          id="video"
          label="Video"
          accept="video/*"
          file={video.file}
          previewUrl={video.previewUrl}
          inputRef={video.inputRef}
          onChange={video.handleFileChange}
          onReset={video.resetFile}
          type="video"
        />

        <InputField
          id="thumbnail"
          label="Thumbnail"
          accept="image/*"
          file={thumbnail.file}
          previewUrl={thumbnail.previewUrl}
          inputRef={thumbnail.inputRef}
          onChange={thumbnail.handleFileChange}
          onReset={thumbnail.resetFile}
          type="image"
        />
        <FormField
          id="visibility"
          label="Visibility"
          value={formData.visibility}
          onChange={handleInputChange}
          as="select"
          options={[
            { value: "public", label: "Public" },
            { value: "private", label: "Private" },
          ]}
          placeholder="Enter a clear and concise video title"
        />
        <button className="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Uploading..." : "Upload vedio"}
        </button>
      </form>
    </div>
  );
};

export default page;
