
import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  typingUsers: Array<{ first_name: string; last_name: string }>;
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (typingUsers.length === 0) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [typingUsers.length]);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].first_name} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].first_name} and ${typingUsers[1].first_name} are typing`;
    } else {
      return `${typingUsers[0].first_name} and ${typingUsers.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getTypingText()}{dots}</span>
    </div>
  );
}
