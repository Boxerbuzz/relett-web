
'use client';

import { useAuth } from '@/lib/auth';
import { StatsCard } from './StatsCard';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';
import { WelcomeCard } from './WelcomeCard';
import { PropertyOverview } from './PropertyOverview';
import { MarketInsights } from './MarketInsights';
import { 
  FileText, 
  Shield, 
  Coins, 
  TrendingUp,
  MapPin,
  DollarSign
} from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();

  const landownerStats = [
    {
      title: 'Total Properties',
      value: 3,
      icon: <MapPin className="h-4 w-4" />,
      description: '2 verified, 1 pending',
      trend: { value: 50, isPositive: true }
    },
    {
      title: 'Verified Properties',
      value: 2,
      icon: <Shield className="h-4 w-4" />,
      description: 'Ready for tokenization'
    },
    {
      title: 'Active Tokens',
      value: 1,
      icon: <Coins className="h-4 w-4" />,
      description: '1 listed for sale'
    },
    {
      title: 'Portfolio Value',
      value: '$2.4M',
      icon: <DollarSign className="h-4 w-4" />,
      description: 'Based on market estimates',
      trend: { value: 12, isPositive: true }
    }
  ];

  const verifierStats = [
    {
      title: 'Pending Reviews',
      value: 8,
      icon: <FileText className="h-4 w-4" />,
      description: 'Awaiting verification'
    },
    {
      title: 'Completed Reviews',
      value: 24,
      icon: <Shield className="h-4 w-4" />,
      description: 'This month',
      trend: { value: 15, isPositive: true }
    },
    {
      title: 'Average Review Time',
      value: '2.3 days',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Industry leading'
    },
    {
      title: 'Monthly Earnings',
      value: '$4,200',
      icon: <DollarSign className="h-4 w-4" />,
      description: 'From verification fees',
      trend: { value: 8, isPositive: true }
    }
  ];

  const stats = user?.role === 'landowner' ? landownerStats : verifierStats;

  return (
    <div className="space-y-8">
      <WelcomeCard />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {user?.role === 'landowner' && <PropertyOverview />}
          <RecentActivity />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <MarketInsights />
        </div>
      </div>
    </div>
  );
}
