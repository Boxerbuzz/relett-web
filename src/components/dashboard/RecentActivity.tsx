
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';

export function RecentActivity() {
  const { user } = useAuth();

  const landownerActivities = [
    {
      id: 1,
      action: 'Land record verified',
      target: 'Downtown Property #123',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      action: 'Document uploaded',
      target: 'Survey Report - Riverside Plot',
      time: '1 day ago',
      status: 'pending'
    },
    {
      id: 3,
      action: 'Token created',
      target: 'Commercial Building Token',
      time: '3 days ago',
      status: 'completed'
    },
    {
      id: 4,
      action: 'Verification requested',
      target: 'Agricultural Land - East Side',
      time: '5 days ago',
      status: 'in_progress'
    }
  ];

  const verifierActivities = [
    {
      id: 1,
      action: 'Verification completed',
      target: 'Residential Property #456',
      time: '1 hour ago',
      status: 'completed'
    },
    {
      id: 2,
      action: 'Review in progress',
      target: 'Commercial Complex - Main St',
      time: '3 hours ago',
      status: 'in_progress'
    },
    {
      id: 3,
      action: 'Document rejected',
      target: 'Industrial Plot #789',
      time: '1 day ago',
      status: 'rejected'
    },
    {
      id: 4,
      action: 'Verification assigned',
      target: 'Farmland - County Road',
      time: '2 days ago',
      status: 'pending'
    }
  ];

  const activities = user?.role === 'landowner' ? landownerActivities : verifierActivities;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your latest actions and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex-1">
                <p className="font-medium text-sm">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.target}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
              <Badge className={getStatusColor(activity.status)}>
                {activity.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
