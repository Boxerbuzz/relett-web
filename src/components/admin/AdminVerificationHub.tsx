
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleRequestManagement } from './RoleRequestManagement';
import { KYCReviewDashboard } from './KYCReviewDashboard';
import { VerifierCredentialReview } from './VerifierCredentialReview';
import { 
  Users, 
  Shield, 
  FileText
} from '@phosphor-icons/react';

export function AdminVerificationHub() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Management Hub</h1>
        <p className="text-gray-600">
          Manage role requests, KYC documents, and verifier credentials from a centralized dashboard.
        </p>
      </div>

      <Tabs defaultValue="role-requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="role-requests" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Role Requests
          </TabsTrigger>
          <TabsTrigger value="kyc-review" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            KYC Review
          </TabsTrigger>
          <TabsTrigger value="verifier-credentials" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verifier Credentials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="role-requests">
          <RoleRequestManagement />
        </TabsContent>

        <TabsContent value="kyc-review">
          <KYCReviewDashboard />
        </TabsContent>

        <TabsContent value="verifier-credentials">
          <VerifierCredentialReview />
        </TabsContent>
      </Tabs>
    </div>
  );
}
