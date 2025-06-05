
'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatLayoutProps {
  children: ReactNode;
  className?: string;
}

export function ChatLayout({ children, className = "" }: ChatLayoutProps) {
  return (
    <div className={`flex flex-col h-full max-h-screen ${className}`}>
      <Card className="flex-1 flex flex-col overflow-hidden">
        {children}
      </Card>
    </div>
  );
}

interface ChatHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ChatHeader({ children, className = "" }: ChatHeaderProps) {
  return (
    <div className={`flex-shrink-0 border-b p-4 bg-white ${className}`}>
      {children}
    </div>
  );
}

interface ChatMessagesProps {
  children: ReactNode;
  className?: string;
}

export function ChatMessages({ children, className = "" }: ChatMessagesProps) {
  return (
    <ScrollArea className={`flex-1 p-4 ${className}`}>
      <div className="space-y-4">
        {children}
      </div>
    </ScrollArea>
  );
}

interface ChatInputProps {
  children: ReactNode;
  className?: string;
}

export function ChatInput({ children, className = "" }: ChatInputProps) {
  return (
    <div className={`flex-shrink-0 border-t p-4 bg-white ${className}`}>
      {children}
    </div>
  );
}
