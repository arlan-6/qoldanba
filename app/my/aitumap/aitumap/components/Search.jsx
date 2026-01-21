"use client";

import { useContext, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MapContext } from "../shared";
import { SearchIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

const Search = () => {
  const {
    isKeyboardTyping,
    selectedBlockOption,
    handleBlockOptionChange,
    search,
    handleSearchInput,
    width,
  } = useContext(MapContext);
  const params = useSearchParams();
  const query = params.get("room") || "";
  useEffect(() => {
    if (query) {
      handleSearchInput({ target: { value: query } });
    }
  }, [query]);
  return (
    <div className="absolute z-20 ml-3 mt-2 flex justify-center flex-wrap">
      <select
        value={selectedBlockOption}
        onChange={handleBlockOptionChange}
        className={cn(
          "h-9 rounded-l-[9px] rounded-r-none border border-input bg-background/90 px-2 text-sm text-foreground shadow-xs backdrop-blur-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
          isKeyboardTyping &&
            "pointer-events-none bg-muted text-muted-foreground",
        )}
      >
        <option value="">all</option>
        <option value="C1.1">C1.1</option>
        <option value="C1.2">C1.2</option>
        <option value="C1.3">C1.3</option>
      </select>
      <div className="relative w-45">
        <Input
          type="text"
          placeholder="126 or C1.2.223"
          value={search}
          onChange={(e) => {
            handleSearchInput(e);
          }}
          className={cn(
            "h-9 rounded-l-none rounded-r-[9px] bg-background/90 pr-9 text-sm text-foreground shadow-xs backdrop-blur-sm",
            "placeholder:text-muted-foreground",
          )}
        />
        <SearchIcon className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <div className="ml-3  text-sm  bg-accent p-2 px-4 rounded-md">
        <p>
          Map created by <a href="https://github.com/Yuujiso/aitumap" className="underline">Yuujiso</a>
        </p>
      </div>
    </div>
  );
};

export default Search;
