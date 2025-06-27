
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { 
  EyeIcon, 
  HeartIcon, 
  CalendarIcon,
  ArrowRightIcon 
} from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'view':
      return EyeIcon;
    case 'like':
    case 'favorite':
      return HeartIcon;
    case 'booking':
    case 'inquiry':
      return CalendarIcon;
    default:
      return EyeIcon;
  }
};

const getActivityColor = (action: string) => {
  switch (action) {
    case 'view':
      return 'text-blue-600';
    case 'like':
    case 'favorite':
      return 'text-red-500';
    case 'booking':
    case 'inquiry':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export function RecentActivityWidget() {
  const { activities, loading } = useRecentActivity();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No recent activity to display
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Badge variant="outline">
            {activities.length} activities
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.slice(0, 8).map((activity) => {
            const Icon = getActivityIcon(activity.action);
            const colorClass = getActivityColor(activity.action);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Icon className={`w-5 h-5 mt-0.5 ${colorClass}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.action === 'view' && 'Viewed property'}
                    {activity.action === 'like' && 'Liked property'}
                    {activity.action === 'favorite' && 'Added to favorites'}
                    {activity.action === 'booking' && 'Made booking'}
                    {activity.action === 'inquiry' && 'Sent inquiry'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-400" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
