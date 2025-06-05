
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
    <div className={`flex flex-col h-full max-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 ${className}`}>
      <Card className="flex-1 flex flex-col overflow-hidden shadow-xl border-blue-200 bg-white/95 backdrop-blur-sm">
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
    <div className={`flex-shrink-0 border-b border-blue-200 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white ${className}`}>
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
    <ScrollArea className={`flex-1 p-4 bg-gradient-to-b from-blue-50/50 to-purple-50/50 ${className}`}>
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
    <div className={`flex-shrink-0 border-t border-blue-200 p-4 bg-gradient-to-r from-white to-blue-50 ${className}`}>
      {children}
    </div>
  );
}
