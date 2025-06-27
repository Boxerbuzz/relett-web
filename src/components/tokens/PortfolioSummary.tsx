
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, MessageSquare, Coins } from 'lucide-react';
import { TrendUpIcon } from '@phosphor-icons/react';

interface PortfolioSummaryProps {
  totalPortfolioValue: number;
  totalROI: number;
  propertyCount: number;
  activeChatCount: number;
}

export function PortfolioSummary({ 
  totalPortfolioValue, 
  totalROI, 
  propertyCount, 
  activeChatCount 
}: PortfolioSummaryProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Portfolio Value</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">
                ${totalPortfolioValue.toLocaleString()}
              </p>
            </div>
            <DollarSign size={20} className="text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average ROI</p>
              <p className={`text-xl lg:text-2xl font-bold ${totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalROI.toFixed(1)}%
              </p>
            </div>
            <TrendUpIcon size={20} className={totalROI >= 0 ? 'text-green-600' : 'text-red-600'} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Properties</p>
              <p className="text-xl lg:text-2xl font-bold text-blue-600">{propertyCount}</p>
            </div>
            <Coins size={20} className="text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Chats</p>
              <p className="text-xl lg:text-2xl font-bold text-purple-600">{activeChatCount}</p>
            </div>
            <MessageSquare size={20} className="text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
