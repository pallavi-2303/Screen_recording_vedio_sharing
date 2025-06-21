"use client";
import { visibilities } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { deleteVideo, updateVideoVisibility } from "@/lib/hooks/actions/video";
import { daysAgo } from "@/lib/hooks/util";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import DropDownList from "./DropdownList";

const VideoDetailHeader = ({
  title,
  createdAt,
  userImg,
  username,
  videoId,
  ownerId,
  visibility,
  thumbnailUrl,
}: VideoDetailHeaderProps) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [visibilityState, setVisibilityState] = useState<Visibility>(
    visibility as Visibility
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  const isOwner = userId === ownerId;
  console.log("ownerId", ownerId);
  console.log("userId", userId);
  console.log("Header", videoId);
  console.log(thumbnailUrl);
  const router = useRouter();
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteVideo(videoId, thumbnailUrl);
      console.log("Video deleted succesfully ");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error deleting video:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  const handleVisibilityChange = async (option: string) => {
    if (option !== visibilityState) {
      setIsUpdating(true);
    }
    try {
      await updateVideoVisibility(videoId, option as Visibility);
      setVisibilityState(option as Visibility);
    } catch (error) {
      console.error("Error updating visibility:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  const handleCopyLink = () => {
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(
        `${window.location.origin}/video/${videoId}`
      );
      setCopied(true);
    }
  };
  useEffect(() => {
    const changeChecked = setTimeout(() => {
      if (copied) setCopied(false);
    }, 2000);
    return () => clearTimeout(changeChecked);
  }, [copied]);
  const TriggerVisibility = (
    <div className="visibility-trigger">
      <div>
        <Image
          src="/assets/icons/eye.svg"
          alt="Views"
          width={16}
          height={16}
          className="mt-0.5"
        />
        <p>{visibilityState}</p>
      </div>
      <div>
        <Image
          src="/assets/icons/arrow-down.svg"
          alt="Arrow Down"
          width={16}
          height={16}
        />
      </div>
    </div>
  );
  return (
    <header className="detail-header">
      <aside className="user-info">
        <h1>{title}</h1>
        <figure>
          <button onClick={() => router.push(`/profile/${ownerId}`)}>
            <Image
              src={userImg || ""}
              alt="user"
              width={24}
              height={24}
              className="rounded-full"
            />
            <h2>{username ?? "Guest"}</h2>
          </button>
          <figcaption>
            <span className="mt-1">©</span>
            <p>{daysAgo(createdAt)}</p>
          </figcaption>
        </figure>
      </aside>
      <aside className="cta">
        <button onClick={handleCopyLink}>
          <Image
            src={
              copied ? "/assets/images/checked.svg" : "/assets/icons/link.svg"
            }
            alt="copy"
            width={24}
            height={24}
          />
        </button>
        {isOwner && (
          <div className="user-btn">
            <button
              className="delete-btn"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete video"}
            </button>
            <div className="bar" />
            {isUpdating ? (
              <div className="update-stats">
                <p>Updating...</p>
              </div>
            ) : (
              <DropDownList
                options={visibilities}
                selectedOption={visibilityState}
                onOptionSelect={handleVisibilityChange}
                triggerElement={TriggerVisibility}
              />
            )}
          </div>
        )}
      </aside>
    </header>
  );
};

export default VideoDetailHeader;
