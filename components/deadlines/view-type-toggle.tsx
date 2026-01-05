import React from "react";
import { List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewTypeToggleProps {
  viewType: "list" | "card";
  setViewType: (type: "list" | "card") => void;
}

const ViewTypeToggle = ({ viewType, setViewType }: ViewTypeToggleProps) => {
  return (
    <div className="hidden md:flex items-center bg-muted/50 p-1 rounded-lg mr-4 border">
      <button
        onClick={() => setViewType("list")}
        className={cn(
          "p-1.5 rounded-md transition-all cursor-pointer",
          viewType === "list"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="List view"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => setViewType("card")}
        className={cn(
          "p-1.5 rounded-md transition-all cursor-pointer",
          viewType === "card"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Card view"
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  );
};

export default ViewTypeToggle;
