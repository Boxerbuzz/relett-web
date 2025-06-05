
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { 
  User, 
  MapPin, 
  Phone, 
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface ProfileWizardProps {
  onComplete?: () => void;
}

export function ProfileWizard({ onComplete }: ProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    // Profile Details
    date_of_birth: '',
    gender: '',
    nationality: '',
    state_of_origin: '',
    lga: '',
    middle_name: '',
    // Address
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postal_code: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user data from users table (consolidated)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      if (userData) {
        setFormData(prev => ({
          ...prev,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          date_of_birth: userData.date_of_birth || '',
          gender: userData.gender || '',
          nationality: userData.nationality || '',
          state_of_origin: userData.state_of_origin || '',
          lga: userData.lga || '',
          middle_name: userData.middle_name || '',
          address: userData.address || {
            street: '',
            city: '',
            state: '',
            country: 'Nigeria',
            postal_code: ''
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updateFormData = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.first_name && formData.last_name && formData.phone;
      case 2:
        return formData.date_of_birth && formData.gender && formData.nationality;
      case 3:
        return formData.address.street && formData.address.city && formData.address.state;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        title: 'Required Fields Missing',
        description: 'Please fill in all required fields before continuing.',
        variant: 'destructive'
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Update users table with all the consolidated data
      const { error: userError } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          bio: formData.bio,
          full_name: `${formData.first_name} ${formData.last_name}`,
          has_setup: true,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          nationality: formData.nationality,
          state_of_origin: formData.state_of_origin,
          lga: formData.lga,
          middle_name: formData.middle_name,
          address: formData.address
        })
        .eq('id', user?.id);

      if (userError) throw userError;

      toast({
        title: 'Profile Completed',
        description: 'Your profile has been successfully set up!',
      });

      onComplete?.();
    } catch (error) {
      console.error('Error completing profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete profile setup',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => (currentStep / 4) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => updateFormData('first_name', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => updateFormData('last_name', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                placeholder="Tell us a bit about yourself..."
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Personal Details</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => updateFormData('date_of_birth', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality *</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => updateFormData('nationality', e.target.value)}
                placeholder="e.g., Nigerian"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state_of_origin">State of Origin</Label>
                <Input
                  id="state_of_origin"
                  value={formData.state_of_origin}
                  onChange={(e) => updateFormData('state_of_origin', e.target.value)}
                  placeholder="e.g., Lagos"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lga">Local Government Area</Label>
                <Input
                  id="lga"
                  value={formData.lga}
                  onChange={(e) => updateFormData('lga', e.target.value)}
                  placeholder="e.g., Ikeja"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                value={formData.middle_name}
                onChange={(e) => updateFormData('middle_name', e.target.value)}
                placeholder="Enter your middle name"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Address Information</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => updateFormData('address.street', e.target.value)}
                placeholder="Enter your street address"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => updateFormData('address.city', e.target.value)}
                  placeholder="e.g., Lagos"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => updateFormData('address.state', e.target.value)}
                  placeholder="e.g., Lagos State"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.address.country}
                  onChange={(e) => updateFormData('address.country', e.target.value)}
                  placeholder="Nigeria"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.address.postal_code}
                  onChange={(e) => updateFormData('address.postal_code', e.target.value)}
                  placeholder="e.g., 100001"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Review & Complete</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Basic Information</h4>
                <p className="text-sm text-gray-600">
                  {formData.first_name} {formData.last_name} • {formData.phone}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Personal Details</h4>
                <p className="text-sm text-gray-600">
                  {formData.gender} • {formData.nationality}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Address</h4>
                <p className="text-sm text-gray-600">
                  {formData.address.street}, {formData.address.city}, {formData.address.state}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">
                Your profile is ready to be completed!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Step {currentStep} of 4 - Let's set up your account
            </CardDescription>
          </div>
          <Badge variant="outline">
            {Math.round(getStepProgress())}% Complete
          </Badge>
        </div>
        <Progress value={getStepProgress()} className="mt-4" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStep()}
        
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={loading}>
              {loading ? 'Completing...' : 'Complete Profile'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
