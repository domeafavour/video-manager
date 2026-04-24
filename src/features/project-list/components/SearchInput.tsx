import { VmInput } from "@/components/ui/vm";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search projects...",
}: SearchInputProps) {
  return (
    <div className="relative w-60">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8d8578]"
      />
      <VmInput
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-auto w-full rounded-lg border-[rgba(214,174,102,0.2)] bg-[rgba(255,255,255,0.04)] py-1.5 pl-8 pr-7 text-[12px] text-[#dbd2c2] transition-all duration-200 placeholder:text-[#8a8070] focus:bg-[rgba(255,255,255,0.07)] focus:shadow-[0_0_0_2px_rgba(214,174,102,0.15)]"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#8d8578] transition-colors hover:text-[#d6ae66]"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
