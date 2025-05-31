
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, User, ShieldCheck } from 'phosphor-react';

interface AccountTypeSelectProps {
  value: 'landowner' | 'verifier';
  onChange: (value: 'landowner' | 'verifier') => void;
}

export function AccountTypeSelect({ value, onChange }: AccountTypeSelectProps) {
  const options = [
    {
      value: 'landowner' as const,
      title: 'Landowner',
      description: 'Manage and tokenize your land properties',
      icon: User,
    },
    {
      value: 'verifier' as const,
      title: 'Verifier',
      description: 'Verify land records as a surveyor or lawyer',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-3">
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
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                isSelected ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Icon className={`h-5 w-5 ${
                  isSelected ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {option.title}
                  </h3>
                  {isSelected && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <p className={`text-sm mt-1 ${
                  isSelected ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {option.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
