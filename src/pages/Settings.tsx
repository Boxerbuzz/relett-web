'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { EmailVerificationStatus } from '@/components/profile/EmailVerificationStatus';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/lib/auth';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Palette,
  Globe,
  Camera,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  PencilSimple,
  FloppyDisk,
  X
} from 'phosphor-react';

const Settings = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Use real user data from profile
  const userData = {
    id: user?.id || '',
    email: user?.email || '',
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    fullName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    avatar: profile?.avatar || '',
    userType: profile?.user_type || 'landowner',
    isActive: profile?.is_active ?? true,
    isVerified: profile?.is_verified ?? false,
    verificationStatus: profile?.verification_status || 'pending',
    hasSetup: Boolean(profile?.first_name && profile?.last_name),
    createdAt: profile?.created_at || '',
    preferences: {
      country: profile?.address?.country || '',
      state: profile?.address?.state || '',
      city: profile?.address?.city || '',
      address: profile?.address?.address_line || '',
      interest: 'Real Estate Investment',
      coordinates: { lat: 6.4281, lng: 3.4219 }
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unverified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle size={16} className="text-green-600" />;
      case 'pending': return <Clock size={16} className="text-yellow-600" />;
      case 'unverified': return <XCircle size={16} className="text-red-600" />;
      default: return <XCircle size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield size={16} />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard size={16} />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette size={16} />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
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
                    <Badge className={getVerificationStatusColor(userData.verificationStatus)} variant="outline">
                      {userData.verificationStatus}
                    </Badge>
                    {userData.isActive && (
                      <Badge className="bg-green-100 text-green-800" variant="outline">
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
                      <X size={16} />
                      Cancel
                    </>
                  ) : (
                    <>
                      <PencilSimple size={16} />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                {isEditingProfile ? 'Update your personal information and profile details' : 'View your profile information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture and Basic Info Display */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <UserAvatar size="xl" />
                <div className="space-y-3 flex-1">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{userData.fullName}</h3>
                    <p className="text-sm text-gray-600">{userData.email}</p>
                    <p className="text-sm text-gray-600">User Type: {userData.userType}</p>
                    <p className="text-sm text-gray-600">Member since: {new Date(userData.createdAt).toLocaleDateString()}</p>
                  </div>
                  {isEditingProfile && (
                    <Button size="sm">
                      <Camera size={16} className="mr-2" />
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
                        <Input id="firstName" defaultValue={userData.firstName} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue={userData.lastName} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={userData.email} />
                        <p className="text-xs text-gray-500">Email changes require verification</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue={userData.phone} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" defaultValue={userData.bio} placeholder="Tell us about yourself..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userType">Account Type</Label>
                        <Select defaultValue={userData.userType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="landowner">Land Owner</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="verifier">Verifier</SelectItem>
                            <SelectItem value="investor">Investor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="interest">Primary Interest</Label>
                        <Input id="interest" defaultValue={userData.preferences.interest} placeholder="e.g., Commercial Real Estate" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin size={18} />
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
                            <SelectItem value="South Africa">South Africa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input id="state" defaultValue={userData.preferences.state} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" defaultValue={userData.preferences.city} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" defaultValue={userData.preferences.address} />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => setIsEditingProfile(false)}>
                      <FloppyDisk size={16} className="mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
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
                      <p className="text-sm text-gray-600">Your email is verified</p>
                    </div>
                    {userData.isVerified ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Profile Setup</p>
                      <p className="text-sm text-gray-600">Profile completed</p>
                    </div>
                    {userData.hasSetup ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Account Active</p>
                      <p className="text-sm text-gray-600">Account status</p>
                    </div>
                    {userData.isActive ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Property Updates</Label>
                    <p className="text-sm text-gray-500">Notifications about your properties</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Market Insights</Label>
                    <p className="text-sm text-gray-500">Weekly market reports and trends</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Token Price Alerts</Label>
                    <p className="text-sm text-gray-500">Alerts when token prices change significantly</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>

              <Button>Update Password</Button>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Login Alerts</Label>
                    <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your payment methods and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Methods</h3>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-5 bg-blue-600 rounded"></div>
                      <div>
                        <p className="font-medium">**** **** **** 4242</p>
                        <p className="text-sm text-gray-500">Expires 12/24</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <Button variant="outline">
                  <CreditCard size={16} className="mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>
                Customize your app experience and interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Language</Label>
                    <p className="text-sm text-gray-500">Choose your preferred language</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Globe size={16} className="mr-2" />
                    English
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Currency</Label>
                    <p className="text-sm text-gray-500">Display prices in your preferred currency</p>
                  </div>
                  <Button variant="outline" size="sm">USD</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
