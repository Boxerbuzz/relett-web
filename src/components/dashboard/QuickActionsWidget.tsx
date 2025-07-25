
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRoles';
import { 
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  PlusIcon,
  ShieldIcon,
  UserIcon,
  FileTextIcon,
  MagnifyingGlassIcon
} from '@phosphor-icons/react';

export function QuickActionsWidget() {
  const navigate = useNavigate();
  const { hasRole } = useUserRoles();

  const userActions = [
    {
      icon: MagnifyingGlassIcon,
      label: 'Browse Properties',
      description: 'Explore available properties',
      action: () => navigate('/marketplace'),
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      icon: CreditCardIcon,
      label: 'View Investments',
      description: 'Check your token portfolio',
      action: () => navigate('/tokens'),
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      icon: CalendarIcon,
      label: 'My Bookings',
      description: 'View reservations & rentals',
      action: () => navigate('/me'),
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    },
    {
      icon: UserIcon,
      label: 'Profile Settings',
      description: 'Update your profile',
      action: () => navigate('/profile'),
      color: 'bg-gray-50 text-gray-600 hover:bg-gray-100'
    }
  ];

  const roleBasedActions = [
    {
      icon: PlusIcon,
      label: 'List Property',
      description: 'Add new property listing',
      action: () => navigate('/property/create'),
      color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
      roles: ['agent', 'landowner']
    },
    {
      icon: ShieldIcon,
      label: 'Verification Tasks',
      description: 'Review properties',
      action: () => navigate('/verification'),
      color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
      roles: ['verifier', 'admin']
    },
    {
      icon: FileTextIcon,
      label: 'Admin Dashboard',
      description: 'Manage platform',
      action: () => navigate('/admin'),
      color: 'bg-red-50 text-red-600 hover:bg-red-100',
      roles: ['admin']
    }
  ];

  // Filter role-based actions based on user's roles
  const availableRoleActions = roleBasedActions.filter(action => 
    action.roles.some(role => hasRole(role as any))
  );

  const allActions = [...userActions, ...availableRoleActions];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-auto p-4 flex flex-col items-start space-y-2 ${action.color}`}
              onClick={action.action}
            >
              <div className="flex items-center space-x-2 w-full">
                <action.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{action.label}</span>
              </div>
              <p className="text-xs opacity-75 text-left">
                {action.description}
              </p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
