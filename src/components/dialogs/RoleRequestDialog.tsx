import { useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  UserIcon,
  BuildingsIcon,
  MapPinIcon,
  CheckCircleIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";

interface RoleRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleRequestDialog({
  open,
  onOpenChange,
}: RoleRequestDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    experience: "",
    credentials: "",
    reason: "",
    licenseNumber: "",
    issuingAuthority: "",
    contactPhone: "",
  });

  const roleOptions = [
    {
      value: "agent",
      label: "Real Estate Agent",
      icon: BuildingsIcon,
      description: "Help buyers and sellers with property transactions",
    },
    {
      value: "landowner",
      label: "Property Owner",
      icon: MapPinIcon,
      description: "List and manage your properties",
    },
    {
      value: "verifier",
      label: "Property Verifier",
      icon: CheckCircleIcon,
      description: "Verify property documents and authenticity",
    },
    {
      value: "surveyor",
      label: "Surveyor",
      icon: FileTextIcon,
      description: "Conduct property surveys and valuations",
    },
  ];

  const selectedRole = roleOptions.find((role) => role.value === formData.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.role || !formData.reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Insert role request into database
      const { error } = await supabase.from("user_role_requests").insert({
        user_id: user.id,
        requested_role: formData.role,
        experience_years: formData.experience
          ? parseInt(formData.experience)
          : null,
        credentials: formData.credentials,
        reason: formData.reason,
        license_number: formData.licenseNumber || null,
        issuing_authority: formData.issuingAuthority || null,
        contact_phone: formData.contactPhone || null,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description:
          "Your role request has been submitted for review. We'll notify you once it's processed.",
      });

      onOpenChange(false);
      setFormData({
        role: "",
        experience: "",
        credentials: "",
        reason: "",
        licenseNumber: "",
        issuingAuthority: "",
        contactPhone: "",
      });
    } catch (error) {
      console.error("Role request error:", error);
      toast({
        title: "Error",
        description: "Failed to submit role request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent size="lg" className="max-h-[90vh]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Request Role Upgrade
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="flex-1 overflow-y-auto px-4 md:px-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role">Role Type *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the role you want to request" />
                </SelectTrigger>
                <SelectContent className="bg-white items-start">
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="h-4 w-4" />
                        <div className="items-start gap-2">
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-gray-500">
                            {role.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRole && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <selectedRole.icon className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">
                    {selectedRole.label}
                  </h3>
                </div>
                <p className="text-sm text-blue-700">
                  {selectedRole.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  placeholder="e.g., 5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  placeholder="Your phone number"
                />
              </div>
            </div>

            {(formData.role === "verifier" || formData.role === "surveyor") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        licenseNumber: e.target.value,
                      })
                    }
                    placeholder="Professional license number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issuingAuthority">Issuing Authority</Label>
                  <Input
                    id="issuingAuthority"
                    value={formData.issuingAuthority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        issuingAuthority: e.target.value,
                      })
                    }
                    placeholder="e.g., Nigerian Institute of Surveyors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="credentials">Qualifications & Credentials</Label>
              <Textarea
                id="credentials"
                rows={3}
                value={formData.credentials}
                onChange={(e) =>
                  setFormData({ ...formData, credentials: e.target.value })
                }
                placeholder="List your relevant qualifications, certifications, or credentials"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Why do you want this role? *</Label>
              <Textarea
                id="reason"
                rows={4}
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Explain your motivation and how you plan to contribute to the platform"
                required
              />
            </div>
          </form>
        </div>

        <ResponsiveDialogFooter>
          <ResponsiveDialogCloseButton />
          <Button type="submit" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Submitting" : "Submit Request"}
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
