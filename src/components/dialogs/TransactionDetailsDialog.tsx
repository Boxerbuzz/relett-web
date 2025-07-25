
'use client';

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, Copy, ExternalLink } from 'lucide-react';

interface TransactionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: {
    id: string;
    type: 'buy' | 'sell';
    propertyName: string;
    tokens: number;
    price: string;
    total: string;
    date: string;
    status: string;
    transactionHash?: string;
    fees?: string;
  };
}

export function TransactionDetailsDialog({ open, onOpenChange, transaction }: TransactionDetailsDialogProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent size="md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            {transaction.type === 'buy' ? (
              <ArrowUpRight size={20} className="text-green-600" />
            ) : (
              <ArrowDownLeft size={20} className="text-red-600" />
            )}
            Transaction Details
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="space-y-6 px-4 md:px-0">
          {/* Transaction Status */}
          <div className="text-center">
            <Badge 
              variant="outline" 
              className={`${
                transaction.status === 'completed' 
                  ? 'text-green-600 border-green-200' 
                  : 'text-yellow-600 border-yellow-200'
              } mb-2`}
            >
              {transaction.status}
            </Badge>
            <h3 className="text-2xl font-bold">
              {transaction.type === 'buy' ? 'Purchase' : 'Sale'} {transaction.status}
            </h3>
            <p className="text-gray-600">{transaction.date}</p>
          </div>

          {/* Transaction Summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Property:</span>
                <span className="font-medium">{transaction.propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tokens:</span>
                <span className="font-medium">{transaction.tokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per Token:</span>
                <span className="font-medium">{transaction.price}</span>
              </div>
              {transaction.fees && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Fees:</span>
                  <span className="font-medium">{transaction.fees}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className={transaction.type === 'buy' ? 'text-red-600' : 'text-green-600'}>
                  {transaction.type === 'buy' ? '-' : '+'}{transaction.total}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Hash */}
          {transaction.transactionHash && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Transaction Hash:</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(transaction.transactionHash!)}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-2 break-all">
                  {transaction.transactionHash}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Receipt Options */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Download Receipt
            </Button>
            <Button variant="outline" className="flex-1">
              Email Receipt
            </Button>
          </div>
        </div>

        <ResponsiveDialogFooter>
          <ResponsiveDialogCloseButton>
            Close
          </ResponsiveDialogCloseButton>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
