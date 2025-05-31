
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Timer } from 'phosphor-react';

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
      // TODO: Implement OTP verification with Supabase
      console.log('Verifying OTP:', data.otp, 'for email:', email);
      onSuccess();
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setValue('otp', value);
  };

  const resendOTP = async () => {
    // TODO: Implement resend OTP
    console.log('Resending OTP to:', email);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit code to {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <Label htmlFor="otp">Enter verification code</Label>
            <InputOTP maxLength={6} value={otp} onChange={handleOTPChange}>
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
            {loading ? 'Verifying...' : 'Verify Code'}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <button
            onClick={resendOTP}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <Timer className="mr-1 h-4 w-4" />
            Didn't receive the code? Resend
          </button>
          
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to sign in
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
