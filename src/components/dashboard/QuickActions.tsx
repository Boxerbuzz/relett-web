
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { 
  PlusIcon, 
  UploadIcon, 
  CoinsIcon, 
  FileTextIcon,
  ShieldIcon,
  EyeIcon
} from '@phosphor-icons/react';

export function QuickActions() {
  const { user } = useAuth();

  const landownerActions = [
    {
      title: 'Add Land Record',
      description: 'Register a new property',
      icon: <PlusIcon className="h-4 w-4" />,
      action: () => console.log('Add land record'),
      variant: 'default' as const
    },
    {
      title: 'Upload Documents',
      description: 'Add supporting documents',
      icon: <UploadIcon className="h-4 w-4" />,
      action: () => console.log('Upload documents'),
      variant: 'outline' as const
    },
    {
      title: 'Create Token',
      description: 'Tokenize verified land',
      icon: <CoinsIcon className="h-4 w-4" />,
      action: () => console.log('Create token'),
      variant: 'outline' as const
    }
  ];

  const verifierActions = [
    {
      title: 'Review Records',
      description: 'Verify pending submissions',
      icon: <FileTextIcon className="h-4 w-4" />,
      action: () => console.log('Review records'),
      variant: 'default' as const
    },
    {
      title: 'Sign Documents',
      description: 'Digitally sign verified records',
      icon: <ShieldIcon className="h-4 w-4" />,
      action: () => console.log('Sign documents'),
      variant: 'outline' as const
    },
    {
      title: 'View History',
      description: 'Check verification history',
      icon: <EyeIcon className="h-4 w-4" />,
      action: () => console.log('View history'),
      variant: 'outline' as const
    }
  ];

  const actions = user?.role === 'landowner' ? landownerActions : verifierActions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="w-full justify-start h-auto p-4"
              onClick={action.action}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {action.icon}
                </div>
                <div className="text-left">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
