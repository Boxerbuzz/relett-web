import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Zap, Pause } from 'lucide-react';

interface TokenStatusBadgeProps {
  status: string;
  saleStartDate?: string;
  saleEndDate?: string;
}

export const TokenStatusBadge: React.FC<TokenStatusBadgeProps> = ({
  status,
  saleStartDate,
  saleEndDate,
}) => {
  const now = new Date();
  const saleStart = saleStartDate ? new Date(saleStartDate) : null;
  const saleEnd = saleEndDate ? new Date(saleEndDate) : null;

  // Determine actual sale status based on dates
  const getSaleStatus = () => {
    if (status === 'token_created') {
      if (saleStart && now < saleStart) {
        return 'coming_soon';
      } else if (!saleStart || now >= saleStart) {
        return 'sale_active';
      }
    }
    
    if (status === 'sale_active') {
      if (saleEnd && now > saleEnd) {
        return 'sale_ended';
      }
      return 'sale_active';
    }

    return status;
  };

  const actualStatus = getSaleStatus();

  const getStatusConfig = () => {
    switch (actualStatus) {
      case 'pending_approval':
        return {
          label: 'Pending Approval',
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'approved':
        return {
          label: 'Approved',
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'token_created':
        return {
          label: 'Token Created',
          variant: 'default' as const,
          icon: Zap,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'coming_soon':
        return {
          label: 'Coming Soon',
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'sale_active':
        return {
          label: 'Sale Active',
          variant: 'default' as const,
          icon: Zap,
          className: 'bg-green-100 text-green-800 border-green-200 animate-pulse'
        };
      case 'sale_ended':
        return {
          label: 'Sale Ended',
          variant: 'secondary' as const,
          icon: Pause,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      case 'minted':
        return {
          label: 'Tokens Distributed',
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'active':
        return {
          label: 'Active',
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'paused':
        return {
          label: 'Paused',
          variant: 'secondary' as const,
          icon: Pause,
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'creation_failed':
        return {
          label: 'Creation Failed',
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Show countdown for coming soon sales
  const showCountdown = actualStatus === 'coming_soon' && saleStart;
  const countdown = showCountdown ? Math.ceil((saleStart!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
      {showCountdown && countdown > 0 && (
        <span className="text-xs">({countdown} days)</span>
      )}
    </Badge>
  );
};