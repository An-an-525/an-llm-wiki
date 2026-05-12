import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}

export function TagFilter({ tags, selected, onChange, label }: TagFilterProps) {
  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div>
      {label && (
        <span className="text-[11px] text-[#8C8C8C] tracking-wider uppercase mb-2 block">
          {label}
        </span>
      )}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={cn(
              "text-[11px] sm:text-[12px] px-2.5 sm:px-3 py-1 rounded-full border transition-all duration-300 truncate max-w-[100px] sm:max-w-none",
              selected.includes(tag)
                ? "border-[#D1B48C]/60 bg-[#D1B48C]/10 text-[#1A1A1A]"
                : "border-[#EAEAEA] bg-transparent text-[#8C8C8C] hover:border-[#D1B48C]/30 hover:text-[#1A1A1A]"
            )}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
