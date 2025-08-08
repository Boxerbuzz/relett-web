'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLinkIcon, InfoIcon } from 'lucide-react';

interface WalletConnectSetupProps {
  onComplete: () => void;
}

export function WalletConnectSetup({ onComplete }: WalletConnectSetupProps) {
  const [projectId, setProjectId] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handleProjectIdChange = (value: string) => {
    setProjectId(value);
    // Basic validation - WalletConnect Project IDs are typically 32 character hex strings
    setIsValid(value.length === 32 && /^[a-f0-9]+$/i.test(value));
  };

  const handleSave = () => {
    if (isValid) {
      // In a real implementation, this would save to environment or config
      // For now, we'll update the config file programmatically
      console.log('Save Project ID:', projectId);
      onComplete();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InfoIcon className="w-5 h-5" />
          WalletConnect Configuration Required
        </CardTitle>
        <CardDescription>
          Configure WalletConnect to enable wallet connections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="w-4 h-4" />
          <AlertDescription>
            To use real wallet connections, you need to set up a WalletConnect Project ID.
            This replaces the manual account input with proper wallet integration.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Visit WalletConnect Cloud</li>
              <li>Create a new project</li>
              <li>Copy your Project ID</li>
              <li>Paste it below</li>
            </ol>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open('https://cloud.walletconnect.com', '_blank')}
          >
            <ExternalLinkIcon className="w-4 h-4 mr-2" />
            Open WalletConnect Cloud
          </Button>

          <div className="space-y-2">
            <Label htmlFor="project-id">WalletConnect Project ID</Label>
            <Input
              id="project-id"
              placeholder="Enter your WalletConnect Project ID"
              value={projectId}
              onChange={(e) => handleProjectIdChange(e.target.value)}
            />
            {projectId && !isValid && (
              <p className="text-xs text-destructive">
                Project ID should be a 32-character hexadecimal string
              </p>
            )}
          </div>

          <Button 
            onClick={handleSave}
            disabled={!isValid}
            className="w-full"
          >
            Configure WalletConnect
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Note:</strong> In development, you can skip this setup and use mock wallet connections. 
            For production, WalletConnect configuration is required for real wallet integration.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}