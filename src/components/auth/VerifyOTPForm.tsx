
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon, TimerIcon, SpinnerIcon } from '@phosphor-icons/react';

const otpSchema = z.object({
  otp: z.string().min(6, 'Please enter the complete OTP'),
});

type OTPForm = z.infer<typeof otpSchema>;

interface VerifyOTPFormProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function VerifyOTPForm({ email, onBack, onSuccess }: VerifyOTPFormProps) {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otp, setOtp] = useState('');
  
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: OTPForm) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: data.otp,
        type: 'email'
      });
      
      if (error) throw error;
      
      toast({
        title: "Email verified successfully!",
        description: "Welcome to the platform."
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setValue('otp', value);
  };

  const resendOTP = async () => {
    try {
      setResendLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      
      if (error) throw error;
      
      toast({
        title: "Code sent",
        description: "A new verification code has been sent to your email."
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend code",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Verify Your Email</h1>
        <p className="text-gray-600 mt-2">
          We've sent a 6-digit code to {email}
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Label htmlFor="otp">Enter verification code</Label>
          <InputOTP maxLength={6} value={otp} onChange={handleOTPChange} disabled={loading}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {errors.otp && (
            <p className="text-sm text-red-600">{errors.otp.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
          {loading ? (
            <>
              <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </Button>
      </form>

      <div className="mt-4 text-center space-y-2">
        <button
          onClick={resendOTP}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          disabled={loading || resendLoading}
        >
          {resendLoading ? (
            <>
              <SpinnerIcon className="mr-1 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <TimerIcon className="mr-1 h-4 w-4" />
              Didn't receive the code? Resend
            </>
          )}
        </button>
        
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            disabled={loading}
          >
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
