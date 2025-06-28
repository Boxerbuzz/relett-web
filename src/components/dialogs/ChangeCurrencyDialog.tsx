'use client';

import { useState } from 'react';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Euro, PoundSterling } from 'lucide-react';

interface ChangeCurrencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCurrency?: string;
}

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', icon: DollarSign },
  { code: 'EUR', name: 'Euro', symbol: '€', icon: Euro },
  { code: 'GBP', name: 'British Pound', symbol: '£', icon: PoundSterling },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', icon: DollarSign },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', icon: DollarSign },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', icon: DollarSign },
];

export function ChangeCurrencyDialog({ open, onOpenChange, currentCurrency = 'USD' }: ChangeCurrencyDialogProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);

  const handleSave = () => {
    // TODO: Implement currency change logic
    console.log('Changing currency to:', selectedCurrency);
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent size="md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <DollarSign size={20} />
            Change Currency
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="space-y-6 px-4 md:px-0">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Select your preferred currency for displaying prices and calculations.
              </p>
              
              <RadioGroup value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <div className="space-y-3">
                  {currencies.map((currency) => {
                    const IconComponent = currency.icon;
                    return (
                      <div key={currency.code} className="flex items-center space-x-3">
                        <RadioGroupItem value={currency.code} id={currency.code} />
                        <Label 
                          htmlFor={currency.code} 
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <IconComponent size={18} className="text-gray-600" />
                          <div className="flex-1">
                            <p className="font-medium">{currency.name}</p>
                            <p className="text-sm text-gray-600">{currency.code} ({currency.symbol})</p>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Note about conversion */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Currency conversion rates are updated in real-time. 
              Your investments will still be processed in the original currency.
            </p>
          </div>
        </div>

        <ResponsiveDialogFooter>
          <ResponsiveDialogCloseButton />
          <Button 
            onClick={handleSave}
            disabled={selectedCurrency === currentCurrency}
          >
            Save Changes
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
