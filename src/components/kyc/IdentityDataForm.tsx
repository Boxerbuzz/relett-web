
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIdentityVerification } from "@/hooks/useIdentityVerification";
import { IdentityType } from "@/types/database";
import { IdentificationCard, Spinner } from "@phosphor-icons/react";

interface IdentityDataFormProps {
  onSuccess: () => void;
  disabled?: boolean;
}

export function IdentityDataForm({ onSuccess, disabled = false }: IdentityDataFormProps) {
  const { toast } = useToast();
  const { createVerification } = useIdentityVerification();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    identityType: "" as IdentityType,
    identityNumber: "",
    fullName: "",
  });

  const identityTypes = [
    { value: "nin" as IdentityType, label: "National Identity Number (NIN)" },
    { value: "bvn" as IdentityType, label: "Bank Verification Number (BVN)" },
    { value: "passport" as IdentityType, label: "International Passport" },
    { value: "drivers_license" as IdentityType, label: "Driver's License" },
    { value: "voters_card" as IdentityType, label: "Voter's Registration Card" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.identityType || !formData.identityNumber || !formData.fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await createVerification({
        identity_type: formData.identityType,
        identity_number: formData.identityNumber,
        full_name: formData.fullName,
      });

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Identity Information Saved",
        description: "You can now proceed to upload your documents",
      });

      onSuccess();
    } catch (error) {
      console.error("Error creating identity verification:", error);
      toast({
        title: "Error",
        description: "Failed to save identity information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IdentificationCard className="h-5 w-5" />
          Identity Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
              }
              placeholder="Enter your full name as it appears on your ID"
              disabled={disabled || submitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="identityType">Identity Document Type *</Label>
            <Select
              value={formData.identityType}
              onValueChange={(value: IdentityType) =>
                setFormData((prev) => ({ ...prev, identityType: value }))
              }
              disabled={disabled || submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select identity document type" />
              </SelectTrigger>
              <SelectContent>
                {identityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="identityNumber">
              {formData.identityType === "nin"
                ? "NIN"
                : formData.identityType === "bvn"
                ? "BVN"
                : "Identity Number"}{" "}
              *
            </Label>
            <Input
              id="identityNumber"
              value={formData.identityNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, identityNumber: e.target.value }))
              }
              placeholder={
                formData.identityType === "nin"
                  ? "Enter your 11-digit NIN"
                  : formData.identityType === "bvn"
                  ? "Enter your 11-digit BVN"
                  : "Enter your identity number"
              }
              disabled={disabled || submitting}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={disabled || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Identity Information"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
