import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "URL không hợp lệ" }, { status: 400 });
    }

    const { stdout } = await execFileAsync("yt-dlp", [
      "--js-runtimes", "node",
      "--dump-json",
      "--no-download",
      "--no-warnings",
      `https://www.youtube.com/watch?v=${videoId}`,
    ], { maxBuffer: 1024 * 1024 * 10 });

    const data = JSON.parse(stdout);

    return NextResponse.json({
      title: data.title || "Unknown",
      thumbnail: data.thumbnail || null,
      duration: data.duration ? formatDuration(data.duration) : "N/A",
      author: data.uploader || data.channel || "Unknown",
    });
  } catch (error) {
    console.error("Error fetching video info:", error);
    return NextResponse.json(
      { error: "Không thể lấy thông tin video. Kiểm tra lại URL." },
      { status: 500 }
    );
  }
}

function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1).split("?")[0];
    }
    return urlObj.searchParams.get("v");
  } catch {
    return null;
  }
}

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
