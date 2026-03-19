import { EyeOff, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface HiddenDeadlinesToggleProps {
  showHidden: boolean;
  setShowHidden: (show: boolean) => void;
}

const HiddenDeadlinesToggle = ({
  showHidden,
  setShowHidden,
}: HiddenDeadlinesToggleProps) => {
  const toggles = [
    {
      active: showHidden,
      onClick: () => setShowHidden(true),
      icon: Eye,
      label: "Show hidden",
    },
    {
      active: !showHidden,
      onClick: () => setShowHidden(false),
      icon: EyeOff,
      label: "Hide hidden",
    },
  ];

  return (
    <div className="flex items-center bg-muted/50 p-1 rounded-lg mr-4 border">
      {toggles.map(({ active, onClick, icon: Icon, label }) => (
        <button
          key={label}
          onClick={onClick}
          className={cn(
            "p-1.5 rounded-md transition-all cursor-pointer",
            active
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={label}
          aria-pressed={active}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
};

export default HiddenDeadlinesToggle;
