
'use client';

import { useAuth } from '@/lib/auth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

export function WelcomeCard() {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  // Get user's display name from profile or fallback to email
  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email?.split('@')[0] || 'User';

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-full">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold mb-2 break-words">
              Welcome back, {displayName}!
            </h1>
            <p className="text-blue-100 mb-4 text-sm md:text-base">
              {user?.role === 'landowner' 
                ? "Ready to manage your land portfolio and explore new opportunities?"
                : "Ready to review land records and help secure property ownership?"
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                {user?.role === 'landowner' ? 'Add Property' : 'Start Review'}
              </Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto text-blue-600 border-white hover:bg-white">
                <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                View Guide
              </Button>
            </div>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="w-24 h-24 xl:w-32 xl:h-32 bg-blue-500 rounded-full opacity-20"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
