import { CardGrid } from "./CardGrid";
import { InfoFeed } from "./InfoFeed";
import { TimelineView } from "./TimelineView";
import { RouteMap } from "./RouteMap";
import type { ViewType, LibraryItem, WorkItem, FeedItem, TimelineItem, PathItem } from "@/lib/types";

interface ModuleRendererProps {
  view: ViewType;
  items: unknown[];
}

export function ModuleRenderer({ view, items }: ModuleRendererProps) {
  switch (view) {
    case "card-grid":
      return <CardGrid items={items as LibraryItem[]} itemType="library" />;
    case "gallery":
      return <CardGrid items={items as WorkItem[]} itemType="work" />;
    case "info-feed":
      return <InfoFeed items={items as FeedItem[]} />;
    case "timeline":
      return <TimelineView items={items as TimelineItem[]} />;
    default:
      return <CardGrid items={items as LibraryItem[]} itemType="library" />;
  }
}

export function PathRouteMap({ path }: { path: PathItem }) {
  return <RouteMap path={path} />;
}
