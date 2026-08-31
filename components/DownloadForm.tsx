"use client";

import { useState } from "react";

interface VideoInfo {
  title: string;
  thumbnail: string | null;
  duration: string;
  author: string;
}

interface DownloadFormProps {
  onInfoLoaded: (info: VideoInfo) => void;
  onDownload: (url: string, quality: string) => void;
  loading: boolean;
}

export default function DownloadForm({
  onInfoLoaded,
  onDownload,
  loading,
}: DownloadFormProps) {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("192");
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Nhập link YouTube vào ô trên");
      return;
    }

    const ytRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]+/;
    if (!ytRegex.test(url)) {
      setError("Link không hợp lệ.");
      return;
    }

    setFetching(true);
    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi");
      onInfoLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lấy được thông tin");
    } finally {
      setFetching(false);
    }
  };

  const isLoading = loading || fetching;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste link YouTube vào đây..."
          disabled={isLoading}
          className="w-full py-4 text-lg border-b-2 border-gray-200 outline-none bg-transparent text-gray-900 placeholder:text-gray-400 focus:border-orange-500 transition-colors"
        />

        {error && (
          <p className="text-red-500 text-sm mt-2 mb-2">{error}</p>
        )}

        <div className="flex items-center gap-4 mt-4">
          {/* Quality */}
          <div className="flex gap-2">
            {["128", "192", "320"].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                  quality === q
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-transparent text-gray-400 border-gray-200 hover:border-orange-300"
                }`}
              >
                {q}K
              </button>
            ))}
          </div>

          {/* Find */}
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              fetching
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {fetching ? "Đang tìm..." : "Tìm bài hát"}
          </button>
        </div>
      </form>

      {/* Download */}
      <button
        type="button"
        onClick={() => onDownload(url, quality)}
        disabled={isLoading || !url.trim()}
        className={`w-full py-4 text-base font-bold rounded-xl mt-6 transition-colors ${
          isLoading || !url.trim()
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-orange-500 text-white hover:bg-orange-600"
        }`}
      >
        Tải nhạc về máy
      </button>
    </div>
  );
}
