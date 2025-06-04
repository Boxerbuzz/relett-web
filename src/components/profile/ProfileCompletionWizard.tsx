
'use client';

import { useState } from 'react';
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
  phone: z.string().min(1, 'Phone number is required'), // Changed from phone_number to phone
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']).optional(), // Removed prefer_not_to_say
  bio: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  address_line: z.string().min(1, 'Address is required'),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileCompletionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  { id: 'personal', title: 'Personal Information', fields: ['first_name', 'last_name', 'phone', 'date_of_birth'] },
  { id: 'additional', title: 'Additional Details', fields: ['gender', 'bio'] },
  { id: 'location', title: 'Location', fields: ['country', 'state', 'city', 'address_line'] },
];

export function ProfileCompletionWizard({ open, onOpenChange }: ProfileCompletionWizardProps) {
  const { profile, updateProfile } = useUserProfile();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '', // Changed from phone_number to phone
      date_of_birth: profile?.date_of_birth || '',
      gender: profile?.gender || 'other', // Changed default to 'other' instead of 'prefer_not_to_say'
      bio: profile?.bio || '',
      country: profile?.address?.country || '',
      state: profile?.address?.state || '',
      city: profile?.address?.city || '',
      address_line: profile?.address?.address_line || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      setLoading(true);
      
      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone, // Changed from phone_number to phone
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        bio: data.bio,
        address: {
          country: data.country,
          state: data.state,
          city: data.city,
          address_line: data.address_line,
        },
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
                  <Input {...form.register('phone')} placeholder="+1 (555) 123-4567" />
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
                  <Label htmlFor="country">Country</Label>
                  <Input {...form.register('country')} placeholder="e.g., Nigeria" />
                  {form.formState.errors.country && (
                    <p className="text-sm text-red-600">{form.formState.errors.country.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input {...form.register('state')} placeholder="e.g., Lagos" />
                    {form.formState.errors.state && (
                      <p className="text-sm text-red-600">{form.formState.errors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input {...form.register('city')} placeholder="e.g., Lagos" />
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-600">{form.formState.errors.city.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="address_line">Address</Label>
                  <Input {...form.register('address_line')} placeholder="Street address" />
                  {form.formState.errors.address_line && (
                    <p className="text-sm text-red-600">{form.formState.errors.address_line.message}</p>
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
