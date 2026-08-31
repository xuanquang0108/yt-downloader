interface VideoInfoProps {
  title: string;
  thumbnail: string | null;
  duration: string;
  author: string;
}

export default function VideoInfo({
  title,
  thumbnail,
  duration,
  author,
}: VideoInfoProps) {
  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <p className="text-xs text-orange-500 font-semibold mb-5 uppercase">
        Đã tìm thấy
      </p>

      <div className="flex items-center gap-4 py-3 border-b border-gray-50">
        <span className="text-sm text-gray-300 font-light w-6 shrink-0">
          01
        </span>

        {thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={title}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">
            {title}
          </p>
          <p className="text-sm text-gray-400">{author}</p>
        </div>

        <span className="text-sm text-gray-300 font-light shrink-0">
          {duration}
        </span>
      </div>
    </div>
  );
}
