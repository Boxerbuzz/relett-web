
import { cn } from '@/lib/utils';
import { CheckCircle, Circle } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  current?: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ProgressIndicator({ 
  steps, 
  className, 
  orientation = 'horizontal' 
}: ProgressIndicatorProps) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {step.completed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className={cn(
                  'h-6 w-6',
                  step.current ? 'text-blue-600 fill-blue-100' : 'text-gray-300'
                )} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className={cn(
                'text-sm font-medium',
                step.current ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'
              )}>
                {step.title}
              </h4>
              {step.description && (
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="absolute left-3 mt-8 h-6 w-px bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            {step.completed ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <Circle className={cn(
                'h-8 w-8',
                step.current ? 'text-blue-600 fill-blue-100' : 'text-gray-300'
              )} />
            )}
            <div className="mt-2 text-center">
              <p className={cn(
                'text-sm font-medium',
                step.current ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'
              )}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              'h-px w-12 mx-4 mt-[-20px]',
              step.completed ? 'bg-green-600' : 'bg-gray-200'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}
