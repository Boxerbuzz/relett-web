
import { CircleNotch } from 'phosphor-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <CircleNotch size={sizeMap[size]} className="animate-spin" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

export function FullPageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}
