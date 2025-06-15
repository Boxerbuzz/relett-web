
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your investment overview</p>
      </div>
      <Badge variant="outline" className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        Live Data
      </Badge>
    </div>
  );
}
