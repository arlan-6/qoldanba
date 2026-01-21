"use client";

import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapContext } from "../shared";

const FloorOptionButton = () => {
  const { selectedFloorOption, floorOptionData, handleFloorOptionClick } =
    useContext(MapContext);

  return (
    <div className="absolute z-[1] top-[46%] right-[20px] flex h-[100px] w-[36px] flex-col items-center justify-between rounded-[10.5px] bg-[#242a36] p-[2px] dark:bg-[#edf2f7]">
      {floorOptionData.map((item) => {
        return (
          <Button
            key={item.id}
            name={item.name}
            onClick={handleFloorOptionClick}
            size="sm"
            variant="ghost"
            className={cn(
              "h-7 w-full rounded-[9px] px-0 text-xs hover:bg-[#4da2ff]",
              selectedFloorOption === item.name
                ? "bg-[#edf2f7] text-[#242a36] dark:bg-[#242a36] dark:text-[#edf2f7]"
                : "bg-[#242a36] text-[#edf2f7] dark:bg-[#edf2f7] dark:text-[#242a36]",
            )}
          >
            {item.id}
          </Button>
        );
      })}
    </div>
  );
};

export default FloorOptionButton;
