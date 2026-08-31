"use client";

import { useState } from "react";
import DownloadForm from "@/components/DownloadForm";
import VideoInfo from "@/components/VideoInfo";

interface VideoData {
  title: string;
  thumbnail: string | null;
  duration: string;
  author: string;
}

export default function Home() {
  const [videoInfo, setVideoInfo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInfoLoaded = (info: VideoData) => {
    setVideoInfo(info);
    setLoading(false);
  };

  const handleDownload = (url: string, quality: string) => {
    const link = document.createElement("a");
    link.href = `/api/download?url=${encodeURIComponent(url)}&quality=${quality}`;
    link.download = "nhac.m4a";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center p-5">
      <div className="w-full max-w-[780px] bg-white rounded-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-900">YT / DOWNLOADER</span>
          <span className="text-xs text-gray-400">Tải nhạc YouTube về máy</span>
        </div>

        {/* Main */}
        <div className="flex gap-8 items-start">
          {/* Left - Vinyl */}
          <div className="flex flex-col items-center shrink-0 pt-2">
            <div className={`vinyl-wrap ${videoInfo ? "" : "vinyl-paused"}`}>
              {videoInfo?.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={videoInfo.thumbnail}
                  alt=""
                  className="vinyl-thumb"
                />
              )}
              <div className="vinyl-center" />
            </div>
            {videoInfo && (
              <div className="mt-4 text-sm text-gray-400">{videoInfo.duration}</div>
            )}
          </div>

          {/* Right - Form + Info */}
          <div className="flex-1 min-w-0">
            <DownloadForm
              onInfoLoaded={handleInfoLoaded}
              onDownload={handleDownload}
              loading={loading}
            />
            {videoInfo && (
              <VideoInfo
                title={videoInfo.title}
                thumbnail={videoInfo.thumbnail}
                duration={videoInfo.duration}
                author={videoInfo.author}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
