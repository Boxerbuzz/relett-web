
'use client';

import { Card } from '@/components/ui/card';
import { UserIcon, ShieldCheckIcon } from '@phosphor-icons/react';

interface AccountTypeSelectProps {
  value: 'landowner' | 'verifier' | 'agent';
  onChange: (value: 'landowner' | 'verifier' | 'agent') => void;
  disabled?: boolean;
}

export function AccountTypeSelect({ value, onChange, disabled = false }: AccountTypeSelectProps) {
  const options = [
    {
      value: 'landowner' as const,
      title: 'Landowner',
      description: 'Manage and tokenize properties',
      icon: UserIcon,
    },
    {
      value: 'verifier' as const,
      title: 'Verifier',
      description: 'Verify land records',
      icon: ShieldCheckIcon,
    },
    {
      value: 'agent' as const,
      title: 'Agent',
      description: 'Verify land records',
      icon: ShieldCheckIcon,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        
        return (
          <Card
            key={option.value}
            className={`p-4 transition-all border-2 ${
              disabled 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer'
            } ${
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => !disabled && onChange(option.value)}
          >
            <div className="text-center">
              <div className={`mx-auto mb-2 p-2 rounded-lg w-fit ${
                isSelected ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Icon className={`h-5 w-5 ${
                  isSelected ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <h3 className={`font-medium text-sm ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {option.title}
                  </h3>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
