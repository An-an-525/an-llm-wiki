import { ArchiveCard } from "@/components/cards/ArchiveCard";
import { WorkCard } from "@/components/cards/WorkCard";
import type { LibraryItem, WorkItem } from "@/lib/types";

type CardGridItem = LibraryItem | WorkItem;

interface CardGridProps {
  items: CardGridItem[];
  itemType?: "library" | "work";
}

export function CardGrid({ items, itemType = "library" }: CardGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-[#8C8C8C] text-sm">
        暂无数据
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        if (itemType === "work") {
          return <WorkCard key={item.id} item={item as WorkItem} />;
        }
        return <ArchiveCard key={item.id} item={item as LibraryItem} />;
      })}
    </div>
  );
}
