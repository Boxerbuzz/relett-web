"use client";

import * as React from "react";
import {
  Copy,
  CornerUpRight,
  FileText,
  Link,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const data = [
  [
    {
      label: "Join Conversation",
      icon: Link,
    },
    {
      label: "Create Conversation",
      icon: FileText,
    },
  ],
  [
    {
      label: "Leave Conversation",
      icon: Link,
    },
    {
      label: "Duplicate",
      icon: Copy,
    },
    {
      label: "Move to",
      icon: CornerUpRight,
    },
    {
      label: "Move to Trash",
      icon: Trash2,
    },
  ],
];

export function AdminActions() {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="data-[state=open]:bg-accent h-7 w-7"
          >
            <MoreHorizontal />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-1"
          align="end"
        >
          <div className="space-y-1">
            {data.map((group, groupIndex) => (
              <div key={groupIndex}>
                {groupIndex > 0 && <div className="border-t my-1" />}
                <div className="space-y-1">
                  {group.map((item, itemIndex) => (
                    <Button
                      key={itemIndex}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8 px-2"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
