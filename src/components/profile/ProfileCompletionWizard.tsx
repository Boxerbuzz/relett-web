'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  bio: z.string().optional(),
  nationality: z.string().min(1, 'Nationality is required'),
  state_of_origin: z.string().min(1, 'State is required'),
  lga: z.string().min(1, 'LGA is required'),
  address: z.string().min(1, 'Address is required'),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileCompletionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  { id: 'personal', title: 'Personal Information', fields: ['first_name', 'last_name', 'phone', 'date_of_birth'] },
  { id: 'additional', title: 'Additional Details', fields: ['gender', 'bio'] },
  { id: 'location', title: 'Location', fields: ['nationality', 'state_of_origin', 'lga', 'address'] },
];

export function ProfileCompletionWizard({ open, onOpenChange }: ProfileCompletionWizardProps) {
  const { profile, updateProfile } = useUserProfile();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      date_of_birth: '',
      gender: 'other',
      bio: '',
      nationality: '',
      state_of_origin: '',
      lga: '',
      address: '',
    },
  });

  // Reset form values when profile data becomes available
  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || 'other',
        bio: profile.bio || '',
        nationality: profile.nationality || '',
        state_of_origin: profile.state_of_origin || '',
        lga: profile.lga || '',
        address: typeof profile.address === 'object' ? profile.address?.address_line : (profile.address || ''),
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      setLoading(true);
      
      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        bio: data.bio,
        nationality: data.nationality,
        state_of_origin: data.state_of_origin,
        lga: data.lga,
        address: {
          address_line: data.address,
          lga: data.lga,
          state: data.state_of_origin,
          country: data.nationality,
        },
        has_setup: true,
      };

      const { error } = await updateProfile(updateData);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully completed!",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const currentStepData = STEPS[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of {STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-medium">{currentStepData.title}</h3>
            
            {currentStep === 0 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input {...form.register('first_name')} />
                    {form.formState.errors.first_name && (
                      <p className="text-sm text-red-600">{form.formState.errors.first_name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input {...form.register('last_name')} />
                    {form.formState.errors.last_name && (
                      <p className="text-sm text-red-600">{form.formState.errors.last_name.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input {...form.register('phone')} placeholder="+234 (555) 123-4567" />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input type="date" {...form.register('date_of_birth')} />
                  {form.formState.errors.date_of_birth && (
                    <p className="text-sm text-red-600">{form.formState.errors.date_of_birth.message}</p>
                  )}
                </div>
              </>
            )}

            {currentStep === 1 && (
              <>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={form.watch('gender')} onValueChange={(value) => form.setValue('gender', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea {...form.register('bio')} placeholder="Tell us about yourself..." rows={3} />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input {...form.register('nationality')} placeholder="e.g., Nigerian" />
                  {form.formState.errors.nationality && (
                    <p className="text-sm text-red-600">{form.formState.errors.nationality.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="state_of_origin">State of Origin</Label>
                    <Input {...form.register('state_of_origin')} placeholder="e.g., Lagos" />
                    {form.formState.errors.state_of_origin && (
                      <p className="text-sm text-red-600">{form.formState.errors.state_of_origin.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lga">LGA</Label>
                    <Input {...form.register('lga')} placeholder="e.g., Ikeja" />
                    {form.formState.errors.lga && (
                      <p className="text-sm text-red-600">{form.formState.errors.lga.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input {...form.register('address')} placeholder="Street address" />
                  {form.formState.errors.address && (
                    <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {currentStep === STEPS.length - 1 ? (
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Complete Profile
                  </>
                )}
              </Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
