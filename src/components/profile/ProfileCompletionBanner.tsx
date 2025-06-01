
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/lib/auth';
import { X, User, Settings } from 'lucide-react';

interface ProfileCompletionBannerProps {
  onDismiss?: () => void;
  onCompleteProfile?: () => void;
}

export function ProfileCompletionBanner({ onDismiss, onCompleteProfile }: ProfileCompletionBannerProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [dismissed, setDismissed] = useState(false);

  const calculateCompletionPercentage = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.first_name,
      profile.last_name,
      profile.phone_number,
      profile.date_of_birth,
      profile.address?.country,
      profile.address?.state,
      profile.address?.city,
      user?.email_confirmed_at, // email verification
    ];
    
    const completedFields = fields.filter(field => field && field !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();
  const isProfileComplete = completionPercentage >= 80;

  useEffect(() => {
    // Auto-dismiss if profile is mostly complete
    if (isProfileComplete) {
      setDismissed(true);
    }
  }, [isProfileComplete]);

  if (dismissed || isProfileComplete) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className="border-blue-200 bg-blue-50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <User className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Complete Your Profile</h3>
              <p className="text-sm text-blue-700 mb-3">
                Complete your profile to unlock all features and improve your experience
              </p>
              
              <div className="flex items-center gap-3 mb-3">
                <Progress value={completionPercentage} className="flex-1 h-2" />
                <span className="text-sm font-medium text-blue-900">
                  {completionPercentage}%
                </span>
              </div>
              
              <Button
                size="sm"
                onClick={onCompleteProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Settings className="mr-2 h-4 w-4" />
                Complete Profile
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
