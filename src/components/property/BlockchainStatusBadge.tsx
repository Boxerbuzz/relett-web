
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  ShieldCheck, 
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';

interface BlockchainStatusBadgeProps {
  isRegistered?: boolean;
  transactionId?: string | null;
  onRegister?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showRegisterButton?: boolean;
}

export function BlockchainStatusBadge({ 
  isRegistered = false, 
  transactionId,
  onRegister,
  size = 'md',
  showRegisterButton = false
}: BlockchainStatusBadgeProps) {
  
  if (isRegistered) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className="bg-green-50 text-green-700 border-green-200"
        >
          <ShieldCheck className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
          Blockchain Registered
        </Badge>
        {transactionId && size !== 'sm' && (
          <span className="text-xs text-gray-500 font-mono">
            TX: {transactionId.slice(0, 8)}...
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className="bg-orange-50 text-orange-700 border-orange-200"
      >
        <AlertCircle className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
        Not Registered
      </Badge>
      {showRegisterButton && onRegister && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={onRegister}
          className="text-xs"
        >
          <LinkIcon className="w-3 h-3 mr-1" />
          Register
        </Button>
      )}
    </div>
  );
}
