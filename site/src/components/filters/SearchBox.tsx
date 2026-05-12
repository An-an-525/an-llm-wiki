import { Search, X } from "lucide-react";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBox({
  value,
  onChange,
  placeholder = "搜索...",
}: SearchBoxProps) {
  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4B9A8]"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 text-[13px] bg-[#F7F5F2] border border-[#EAEAEA] rounded-lg text-[#1A1A1A] placeholder:text-[#C4B9A8] focus:outline-none focus:border-[#D1B48C]/60 focus:ring-1 focus:ring-[#D1B48C]/20 transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#C4B9A8] hover:text-[#8C8C8C] transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
