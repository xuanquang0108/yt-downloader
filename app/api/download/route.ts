import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const quality = request.nextUrl.searchParams.get("quality") || "192";

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "URL không hợp lệ" }, { status: 400 });
    }

    const child = spawn("yt-dlp", [
      "--js-runtimes", "node",
      "-x",
      "--audio-format", "mp3",
      "--audio-quality", `${quality}K`,
      "--no-playlist",
      "--no-warnings",
      "-o", "-",
      "--", `https://www.youtube.com/watch?v=${videoId}`,
    ]);

    let title = "audio";
    try {
      const { execFile } = await import("child_process");
      const { promisify } = await import("util");
      const execFileAsync = promisify(execFile);
      const { stdout } = await execFileAsync("yt-dlp", [
        "--js-runtimes", "node",
        "--print", "title",
        "--no-download",
        "--no-warnings",
        "--no-playlist",
        `https://www.youtube.com/watch?v=${videoId}`,
      ]);
      title = stdout.trim().replace(/[^\w\s-]/g, "").trim() || "audio";
    } catch {
      title = "audio";
    }

    child.stderr.on("data", (data: Buffer) => {
      console.error("yt-dlp stderr:", data.toString());
    });

    return new NextResponse(child.stdout as unknown as ReadableStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${title}.mp3"`,
      },
    });
  } catch (error) {
    console.error("Error downloading video:", error);
    return NextResponse.json(
      { error: "Không thể tải video. Thử lại sau." },
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
