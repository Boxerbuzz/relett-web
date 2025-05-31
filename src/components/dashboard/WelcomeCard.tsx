
'use client';

import { useAuth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

export function WelcomeCard() {
  const { user } = useAuth();

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-blue-100 mb-4">
              {user?.role === 'landowner' 
                ? "Ready to manage your land portfolio and explore new opportunities?"
                : "Ready to review land records and help secure property ownership?"
              }
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {user?.role === 'landowner' ? 'Add Property' : 'Start Review'}
              </Button>
              <Button variant="outline" size="sm" className="text-blue-600 border-white hover:bg-white">
                <FileText className="w-4 h-4 mr-2" />
                View Guide
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-blue-500 rounded-full opacity-20"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
