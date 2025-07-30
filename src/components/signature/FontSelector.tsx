import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface FontSelectorProps {
  selectedFont: string;
  onFontChange: (font: string) => void;
  disabled?: boolean;
}

const signatureFonts = [
  'Dancing Script',
  'Great Vibes',
  'Satisfy',
  'Kalam',
  'Playfair Display',
  'Libre Baskerville',
  'Crimson Text',
  'Merriweather'
];

export function FontSelector({ selectedFont, onFontChange, disabled }: FontSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Choose Font Style</label>
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {signatureFonts.map((font) => (
            <Button
              key={font}
              variant={selectedFont === font ? "default" : "outline"}
              size="sm"
              onClick={() => onFontChange(font)}
              disabled={disabled}
              className={cn(
                "whitespace-nowrap min-w-fit px-3",
                selectedFont === font && "bg-primary text-primary-foreground"
              )}
              style={{ fontFamily: `"${font}", cursive` }}
            >
              {font}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}