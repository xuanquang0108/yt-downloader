import { NextRequest, NextResponse } from "next/server";
import { Innertube, Platform } from "youtubei.js";

Platform.shim.eval = async (data) => {
  return new Function(data.output)();
};

let yt: Innertube | null = null;

async function getYT() {
  if (!yt) {
    yt = await Innertube.create({
      lang: "vi",
      location: "VN",
      retrieve_player: true,
      generate_session_locally: true,
    });
  }
  return yt;
}

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

    const ytInstance = await getYT();
    const info = await ytInstance.getBasicInfo(videoId, { client: "IOS" });
    const title =
      (info.basic_info.title || "audio")
        .replace(/[^\w\s-]/g, "")
        .trim() || "audio";

    const audioFormats =
      info.streaming_data?.adaptive_formats?.filter((f) =>
        f.mime_type?.includes("audio")
      ) || [];

    if (audioFormats.length === 0) {
      throw new Error("Không tìm thấy format audio");
    }

    const bestFormat = audioFormats.sort(
      (a, b) => (b.bitrate || 0) - (a.bitrate || 0)
    )[0];

    if (!bestFormat.url) {
      throw new Error("Không tìm thấy URL download");
    }

    const response = await fetch(bestFormat.url, {
      headers: {
        "Origin": "https://www.youtube.com",
        "Referer": "https://www.youtube.com/",
      },
    });

    if (!response.ok || !response.body) {
      throw new Error("Download failed: " + response.status);
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "audio/mp4",
        "Content-Disposition": `attachment; filename="${title}.m4a"`,
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
