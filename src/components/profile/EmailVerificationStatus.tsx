"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeSimpleIcon,
} from "@phosphor-icons/react";

export function EmailVerificationStatus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resending, setResending] = useState(false);

  // Check if email is verified from auth metadata
  const isEmailVerified = user?.email_confirmed_at != null;

  const handleResendVerification = async () => {
    if (!user?.email) return;

    try {
      setResending(true);
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Verification email sent",
        description: "Please check your email inbox for the verification link.",
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      toast({
        title: "Error",
        description: "Failed to resend verification email",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  if (isEmailVerified) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <h3 className="font-medium text-green-900">Email Verified</h3>
              <p className="text-sm text-green-700">
                Your email address has been verified
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800" variant="outline">
              Verified
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <ClockIcon className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <h3 className="font-medium text-yellow-900">
              Email Verification Pending
            </h3>
            <p className="text-sm text-yellow-700">
              Please check your email and click the verification link to
              activate your account
            </p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800" variant="outline">
            Pending
          </Badge>
        </div>
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={resending}
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            {resending ? (
              <>
                <ClockIcon className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <EnvelopeSimpleIcon className="mr-2 h-4 w-4" />
                Resend Verification
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
