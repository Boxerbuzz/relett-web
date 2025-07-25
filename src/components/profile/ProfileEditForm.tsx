import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useUserProfile, UserProfileData } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPinIcon, FloppyDiskIcon, XIcon } from "@phosphor-icons/react";

interface ProfileEditFormProps {
  userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string;
    bio: string;
    avatar: string;
    userType: string;
    isActive: boolean;
    isVerified: boolean;
    verificationStatus: string;
    hasSetup: boolean;
    createdAt: string;
    preferences: {
      country: string;
      state: string;
      city: string;
      address: string;
      interest: string;
      coordinates: { lat: number; lng: number };
    };
  };
  onCancel: () => void;
  onSave: () => void;
}

export function ProfileEditForm({
  userData,
  onCancel,
  onSave,
}: ProfileEditFormProps) {
  const { updateProfile } = useUserProfile();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    bio: userData.bio,
    interest: userData.preferences.interest,
    country: userData.preferences.country,
    state: userData.preferences.state,
    city: userData.preferences.city,
    address: userData.preferences.address,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Prepare the updates object
      const updates: Partial<UserProfileData> = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        address: formData.address,
        interest: formData.interest,
      };

      const { error } = await updateProfile(updates);

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      onSave();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Separator />

      {/* Personal Information */}
      <div className="space-y-4">
        <h4 className="font-semibold">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={formData.email} disabled />
            <p className="text-xs text-gray-500">
              Email changes require verification
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="interest">Primary Interest</Label>
            <Select
              value={formData.interest}
              onValueChange={(value) => handleInputChange("interest", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="property_rental">Property Rental</SelectItem>
                <SelectItem value="co_living">Co-Living Spaces</SelectItem>
                <SelectItem value="property_management">
                  Property Management
                </SelectItem>
                <SelectItem value="real_estate_investor">
                  Real Estate Investor
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Location Information */}
      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <MapPinIcon size={18} />
          Location Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => handleInputChange("country", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nigeria">Nigeria</SelectItem>
                <SelectItem value="Ghana">Ghana</SelectItem>
                <SelectItem value="Kenya">Kenya</SelectItem>
                <SelectItem value="South Africa">South Africa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          <FloppyDiskIcon size={16} className="mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          <XIcon size={16} className="mr-2" />
          Cancel
        </Button>
      </div>
    </>
  );
}
