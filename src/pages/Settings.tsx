"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { RoleRequestHistory } from "@/components/profile/RoleRequestHistory";
import { RoleRequestDialog } from "@/components/dialogs/RoleRequestDialog";
import {
  UserIcon,
  BellIcon,
  ShieldIcon,
  UserPlusIcon,
  GearIcon,
  CreditCardIcon,
} from "@phosphor-icons/react";
import BillingSettings from "@/components/settings/BillingSettings";
import PreferenceSettings from "@/components/settings/PreferenceSettings";

const Settings = () => {
  const [showRoleRequestDialog, setShowRoleRequestDialog] = useState(false);

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <BellIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <GearIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <UserPlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Roles</span>
          </TabsTrigger>
        </TabsList>

        <div className="w-full max-w-full overflow-hidden">
          <TabsContent value="security" className="space-y-6 w-full max-w-full">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6 w-full max-w-full">
            <BillingSettings />
          </TabsContent>

          <TabsContent
            value="preferences"
            className="space-y-6 w-full max-w-full"
          >
            <PreferenceSettings />
          </TabsContent>
          <TabsContent value="roles" className="space-y-6">
            <RoleRequestHistory
              onSubmitNewRequest={() => setShowRoleRequestDialog(true)}
            />
          </TabsContent>
        </div>
      </Tabs>

      <RoleRequestDialog
        open={showRoleRequestDialog}
        onOpenChange={setShowRoleRequestDialog}
      />
    </div>
  );
};

export default Settings;
