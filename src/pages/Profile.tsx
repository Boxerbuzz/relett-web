import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailVerificationStatus } from "@/components/profile/EmailVerificationStatus";
import { KYCUploadForm } from "@/components/kyc/KYCUploadForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserIcon,
  FileTextIcon,
  CameraIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PencilSimpleIcon,
  FloppyDiskIcon,
  XIcon,
} from "@phosphor-icons/react";

const Profile = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Use real user data from profile
  const userData = {
    id: user?.id || "",
    email: user?.email || "",
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    fullName:
      `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
      "User",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    avatar: profile?.avatar || "",
    userType: profile?.user_type || "landowner",
    isActive: profile?.is_active ?? true,
    isVerified: profile?.is_verified ?? false,
    verificationStatus: profile?.verification_status || "pending",
    hasSetup: Boolean(profile?.first_name && profile?.last_name),
    createdAt: profile?.created_at || "",
    preferences: {
      country: profile?.address?.country || "",
      state: profile?.address?.state || "",
      city: profile?.address?.city || "",
      address: profile?.address?.address_line || "",
      interest: "property_rental",
      coordinates: { lat: 6.4281, lng: 3.4219 },
    },
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "unverified":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircleIcon size={16} className="text-green-600" />;
      case "pending":
        return <ClockIcon size={16} className="text-yellow-600" />;
      case "unverified":
        return <XCircleIcon size={16} className="text-red-600" />;
      default:
        return <XCircleIcon size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6 mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            KYC Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 w-full max-w-full">
          {/* Email Verification Status */}
          <EmailVerificationStatus />

          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>Profile Information</CardTitle>
                  <div className="flex gap-2">
                    {getVerificationIcon(userData.verificationStatus)}
                    <Badge
                      className={getVerificationStatusColor(
                        userData.verificationStatus
                      )}
                      variant="outline"
                    >
                      {userData.verificationStatus}
                    </Badge>
                    {userData.isActive && (
                      <Badge
                        className="bg-green-100 text-green-800"
                        variant="outline"
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant={isEditingProfile ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="flex items-center gap-2"
                >
                  {isEditingProfile ? (
                    <>
                      <XIcon size={16} />
                      Cancel
                    </>
                  ) : (
                    <>
                      <PencilSimpleIcon size={16} />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                {isEditingProfile
                  ? "Update your personal information and profile details"
                  : "View your profile information"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture and Basic Info Display */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <UserAvatar size="xl" />
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold truncate">
                      {userData.fullName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {userData.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Member since:{" "}
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {isEditingProfile && (
                    <Button size="sm">
                      <CameraIcon size={16} className="mr-2" />
                      Change Photo
                    </Button>
                  )}
                </div>
              </div>

              {/* Editable Profile Information */}
              {isEditingProfile && (
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
                          defaultValue={userData.firstName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue={userData.lastName} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={userData.email}
                        />
                        <p className="text-xs text-gray-500">
                          Email changes require verification
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue={userData.phone} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          defaultValue={userData.bio}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="interest">Primary Interest</Label>
                        <Select defaultValue={userData.preferences.interest}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="property_rental">
                              Property Rental
                            </SelectItem>
                            <SelectItem value="co_living">
                              Co-Living Spaces
                            </SelectItem>
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
                        <Select defaultValue={userData.preferences.country}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nigeria">Nigeria</SelectItem>
                            <SelectItem value="Ghana">Ghana</SelectItem>
                            <SelectItem value="Kenya">Kenya</SelectItem>
                            <SelectItem value="South Africa">
                              South Africa
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          defaultValue={userData.preferences.state}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          defaultValue={userData.preferences.city}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          defaultValue={userData.preferences.address}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => setIsEditingProfile(false)}>
                      <FloppyDiskIcon size={16} className="mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {/* Account Status - Always visible */}
              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Account Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Verified</p>
                      <p className="text-sm text-gray-600">
                        Your email is verified
                      </p>
                    </div>
                    {userData.isVerified ? (
                      <CheckCircleIcon size={20} className="text-green-600" />
                    ) : (
                      <XCircleIcon size={20} className="text-red-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Profile Setup</p>
                      <p className="text-sm text-gray-600">Profile completed</p>
                    </div>
                    {userData.hasSetup ? (
                      <CheckCircleIcon size={20} className="text-green-600" />
                    ) : (
                      <XCircleIcon size={20} className="text-red-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Account Active</p>
                      <p className="text-sm text-gray-600">Account status</p>
                    </div>
                    {userData.isActive ? (
                      <CheckCircleIcon size={20} className="text-green-600" />
                    ) : (
                      <XCircleIcon size={20} className="text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc">
          <KYCUploadForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
