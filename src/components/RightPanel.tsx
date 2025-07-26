"use client";

import { useRightPanel } from "@/contexts/RightPanelContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function RightPanel() {
  const { isOpen, content, title, close } = useRightPanel();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // On mobile, render as a sheet (drawer)
  if (!isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
        <SheetContent side="right" className="w-full sm:w-96">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full mt-6">
            {content}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  // On desktop, render as a fixed panel
  return (
    <div
      className={cn(
        "fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-200 shadow-lg z-20",
        "transition-all duration-300 ease-in-out",
        "flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {title || "Panel"}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={close}
          className="flex-shrink-0 ml-2"
        >
          <XIcon size={20} />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {content}
        </div>
      </ScrollArea>
    </div>
  );
}