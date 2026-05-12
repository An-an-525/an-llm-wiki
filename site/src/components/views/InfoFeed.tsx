import { FeedItemCard } from "@/components/cards/FeedItem";
import type { FeedItem } from "@/lib/types";

interface InfoFeedProps {
  items: FeedItem[];
}

export function InfoFeed({ items }: InfoFeedProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-[#8C8C8C] text-sm">
        暂无数据
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <FeedItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
