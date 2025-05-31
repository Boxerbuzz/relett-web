
'use client';

import { Card } from '@/components/ui/card';
import { Check, User, ShieldCheck } from 'phosphor-react';

interface AccountTypeSelectProps {
  value: 'landowner' | 'verifier' | 'agent';
  onChange: (value: 'landowner' | 'verifier' | 'agent') => void;
}

export function AccountTypeSelect({ value, onChange }: AccountTypeSelectProps) {
  const options = [
    {
      value: 'landowner' as const,
      title: 'Landowner',
      description: 'Manage and tokenize properties',
      icon: User,
    },
    {
      value: 'verifier' as const,
      title: 'Verifier',
      description: 'Verify land records',
      icon: ShieldCheck,
    },
    {
      value: 'agent' as const,
      title: 'Agent',
      description: 'Verify land records',
      icon: ShieldCheck,
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
            className={`p-4 cursor-pointer transition-all border-2 ${
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onChange(option.value)}
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
                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
