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

    return NextResponse.json({
      title: info.basic_info.title || "Unknown",
      thumbnail: info.basic_info.thumbnail?.[0]?.url || null,
      duration: info.basic_info.duration
        ? formatDuration(info.basic_info.duration)
        : "N/A",
      author: info.basic_info.channel?.name || "Unknown",
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
