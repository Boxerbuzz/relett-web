
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

interface EmailData {
  to: string;
  template: string;
  data: Record<string, any>;
}

export function useEmailService() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendEmail = async (emailData: EmailData) => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) throw error;

      toast({
        title: 'Email Sent',
        description: 'Email has been sent successfully.',
      });

      return data;
    } catch (error) {
      console.error('Email sending error:', error);
      toast({
        title: 'Email Failed',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const sendPropertyVerificationEmail = async (userEmail: string, propertyTitle: string, verificationStatus: string) => {
    return sendEmail({
      to: userEmail,
      template: 'property-verification',
      data: {
        propertyTitle,
        verificationStatus,
        timestamp: new Date().toISOString()
      }
    });
  };

  const sendWelcomeEmail = async (userEmail: string, userName: string) => {
    return sendEmail({
      to: userEmail,
      template: 'welcome',
      data: {
        userName,
        timestamp: new Date().toISOString()
      }
    });
  };

  return {
    sendEmail,
    sendPropertyVerificationEmail,
    sendWelcomeEmail,
    isSending
  };
}
