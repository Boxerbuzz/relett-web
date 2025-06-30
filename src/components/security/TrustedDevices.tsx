
import { useState } from 'react';
import { useDeviceManager } from '@/hooks/useDeviceManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { 
  DevicesIcon, 
  ShieldCheckIcon, 
  TrashIcon,
  DesktopIcon,
  DeviceMobileIcon,
  DeviceTabletIcon 
} from '@phosphor-icons/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function TrustedDevices() {
  const { devices, loading, currentDevice, trustDevice, revokeDevice } = useDeviceManager();
  const [revoking, setRevoking] = useState<string | null>(null);
  const [trusting, setTrusting] = useState<string | null>(null);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <DeviceMobileIcon className="h-5 w-5" />;
      case 'tablet':
        return <DeviceTabletIcon className="h-5 w-5" />;
      default:
        return <DesktopIcon className="h-5 w-5" />;
    }
  };

  const handleTrustDevice = async (deviceId: string) => {
    setTrusting(deviceId);
    await trustDevice(deviceId);
    setTrusting(null);
  };

  const handleRevokeDevice = async (deviceId: string) => {
    setRevoking(deviceId);
    await revokeDevice(deviceId);
    setRevoking(null);
  };

  const formatLastUsed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DevicesIcon className="h-5 w-5" />
            Trusted Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DevicesIcon className="h-5 w-5" />
          Trusted Devices
        </CardTitle>
        <CardDescription>
          Manage devices that have access to your account. You can trust devices you use regularly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {devices.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No devices found</p>
        ) : (
          devices.map((device) => {
            const isCurrentDevice = currentDevice?.deviceId === device.device_id;
            
            return (
              <div 
                key={device.id} 
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  isCurrentDevice ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getDeviceIcon(device.device_type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{device.device_name}</span>
                      {isCurrentDevice && (
                        <Badge variant="secondary" className="text-xs">
                          Current Device
                        </Badge>
                      )}
                      {device.is_trusted && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          <ShieldCheckIcon className="h-3 w-3 mr-1" />
                          Trusted
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Last used: {formatLastUsed(device.last_used_at)}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-md">
                      {device.user_agent}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!device.is_trusted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTrustDevice(device.id)}
                      disabled={trusting === device.id}
                    >
                      {trusting === device.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <ShieldCheckIcon className="h-4 w-4 mr-1" />
                          Trust
                        </>
                      )}
                    </Button>
                  )}
                  
                  {!isCurrentDevice && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Device Access</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to revoke access for "{device.device_name}"? 
                            This device will need to be re-verified on next login.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevokeDevice(device.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {revoking === device.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              'Revoke Access'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
