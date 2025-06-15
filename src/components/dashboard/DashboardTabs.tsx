
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, TrendingUp, Bell, Search } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="overview" className="flex items-center gap-2">
        <Home className="w-4 h-4" />
        Overview
      </TabsTrigger>
      <TabsTrigger value="market" className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Market
      </TabsTrigger>
      <TabsTrigger value="notifications" className="flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Notifications
      </TabsTrigger>
      <TabsTrigger value="properties" className="flex items-center gap-2">
        <Search className="w-4 h-4" />
        Explore
      </TabsTrigger>
    </TabsList>
  );
}
