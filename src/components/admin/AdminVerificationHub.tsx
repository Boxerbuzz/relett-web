
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleRequestManagement } from "./RoleRequestManagement";
import { KYCReviewDashboard } from "./KYCReviewDashboard";
import { VerifierCredentialReview } from "./VerifierCredentialReview";
import { SystemNotificationCreator } from "./SystemNotificationCreator";
import {
  UsersIcon,
  ShieldIcon,
  FileTextIcon,
  GavelIcon,
  SpeakerphoneIcon,
} from "@phosphor-icons/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function AdminVerificationHub() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GavelIcon className="h-5 w-5" />
          Admin Management Hub
        </CardTitle>
        <CardDescription>
          Manage role requests, KYC documents, verifier credentials, and system notifications from a
          centralized dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="role-requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="role-requests"
              className="flex items-center gap-2"
            >
              <UsersIcon className="h-4 w-4" />
              Role Requests
            </TabsTrigger>
            <TabsTrigger value="kyc-review" className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4" />
              KYC Review
            </TabsTrigger>
            <TabsTrigger
              value="verifier-credentials"
              className="flex items-center gap-2"
            >
              <ShieldIcon className="h-4 w-4" />
              Verifier Credentials
            </TabsTrigger>
            <TabsTrigger
              value="system-notifications"
              className="flex items-center gap-2"
            >
              <SpeakerphoneIcon className="h-4 w-4" />
              System Notifications
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

          <TabsContent value="system-notifications">
            <SystemNotificationCreator />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
