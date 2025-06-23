"use client";
import { cn, parseTranscript } from "@/lib/hooks/util";
import React, { useState } from "react";
import EmptyState from "./EmptyState";
import { year } from "drizzle-orm/mysql-core";
import { metadata } from "@/app/layout";
import { infos } from "@/constants";

const VideoInfo = ({
  transcript,
  createdAt,
  description,
  videoId,
  videoUrl,
  title,
}: VideoInfoProps) => {
  const [info, setInfo] = useState("transcript");
  const parsedTranscipt = parseTranscript(transcript || "");
  const renderTranscript = () => (
    <ul className="transcript">
      {parsedTranscipt.length > 0 ? (
        parsedTranscipt.map((item, index) => (
          <li key={index}>
            <h2>[{item.time}]</h2>
            <p>{item.text}</p>
          </li>
        ))
      ) : (
        <EmptyState
          icon="/assets/icons/copy.svg"
          title="No transcript available"
          description="This video doesn’t include any transcribed content!"
        />
      )}
    </ul>
  );
  const metaDatas = [
    {
      label: "Video Title",
      value: `${title}-${new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}`,
    },
    {
      label: "Video description",
      value: description,
    },
    {
      label: "Video id",
      value: videoId,
    },
    {
      label: "Video url",
      value: videoUrl,
    },
  ];
  const renderMetadata = () => (
    <div className="metadata">
      {metaDatas.map(({ label, value }, index) => (
        <article key={index}>
          <h2>{label}</h2>
          <p
            className={cn({ "text-pink-100 truncate": label === "Video url" })}
          >
            {value}
          </p>
        </article>
      ))}
    </div>
  );
  return <section className="video-info">
<nav>
    {infos.map((item)=>(
        <button key={item}  className={cn({
              "text-pink-100 border-b-2 border-pink-100": info === item,
            })}
            onClick={()=>setInfo(item)} >
            {item}
        </button>
    ))}
</nav>
{info==="transcript" ? renderTranscript() : renderMetadata()}
  </section>
};

export default VideoInfo;
