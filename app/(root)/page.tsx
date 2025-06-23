export const dynamic = "force-dynamic";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import Pagination from "@/components/Pagination";
import VideoCard from "@/components/VideoCard";
import { dummyCards } from "@/constants";
import { getAllVideos } from "@/lib/hooks/actions/video";
import React from "react";

const page = async ({ searchParams }: SearchParams) => {
  const { query, filter, page } = await searchParams;
  const { videos, pagination } = await getAllVideos(
    query,
    filter,
    Number(page) || 1
  );
  return (
    <main className="wrapper page">
      <Header title="All Videos" subHeader="Public Library" />
      {videos.length > 0 ? (
        <section className="video-grid">
          {videos.map(({ video, user }) => (
            <VideoCard
              key={video.id}
              id={video.videoId}
              title={video.title}
              thumbnail={video.thumbnailUrl}
              createdAt={video.createdAt}
              userImg={user?.image ?? ""}
              username={user?.name ?? "Guest"}
              views={video.views}
              visibility={video.visibility}
              duration={video.duration}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          icon="/assets/icons/video.svg"
          title="No videos found"
          description="Try adjucting your search"
        />
      )}
      {pagination?.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          queryString={query}
          filterString={filter}
        />
      )}
    </main>
  );
};

export default page;
