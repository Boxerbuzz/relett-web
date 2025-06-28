import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ShieldIcon,
  CheckCircleIcon,
  FileTextIcon,
  CalendarIcon,
  CertificateIcon,
} from "@phosphor-icons/react";

export function VerifierOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    verifier_type: "",
    license_number: "",
    issuing_authority: "",
    license_name: "",
    issue_date: "",
    expiry_date: "",
    documents: [] as File[],
  });

  const verifierTypes = [
    { value: "surveyor", label: "Professional Surveyor" },
    { value: "lawyer", label: "Property Lawyer" },
    { value: "estate_agent", label: "Licensed Estate Agent" },
    { value: "government_official", label: "Government Official" },
    { value: "chartered_surveyor", label: "Chartered Surveyor" },
  ];

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setFormData((prev) => ({
        ...prev,
        documents: Array.from(files),
      }));
    }
  };

  const uploadDocuments = async () => {
    const uploadedUrls = [];

    for (const file of formData.documents) {
      const fileName = `${user?.id}/${Date.now()}_${file.name}`;

      const { data, error } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(fileName);

      uploadedUrls.push({
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size,
      });
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      // Upload documents first
      const uploadedDocuments = await uploadDocuments();

      // Create verifier credential record
      const { error } = await supabase.from("verifier_credentials").insert({
        user_id: user.id,
        verifier_type: formData.verifier_type as any,
        license_number: formData.license_number,
        issuing_authority: formData.issuing_authority,
        license_name: formData.license_name,
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date,
        documents: uploadedDocuments,
        verification_status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description:
          "Your verifier application has been submitted for review. You will be notified once it has been processed.",
      });

      setStep(4); // Success step
    } catch (error) {
      console.error("Error submitting verifier application:", error);
      toast({
        title: "Error",
        description: "Failed to submit verifier application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <ShieldIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Become a Verifier
        </h1>
        <p className="text-gray-600">
          Join our network of professional verifiers and help ensure property
          authenticity
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CertificateIcon className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="verifier_type">Verifier Type *</Label>
              <Select
                value={formData.verifier_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, verifier_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your professional type" />
                </SelectTrigger>
                <SelectContent>
                  {verifierTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="license_number">License Number *</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) =>
                    setFormData({ ...formData, license_number: e.target.value })
                  }
                  placeholder="Professional license number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="issuing_authority">Issuing Authority *</Label>
                <Input
                  id="issuing_authority"
                  value={formData.issuing_authority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      issuing_authority: e.target.value,
                    })
                  }
                  placeholder="e.g., Nigerian Institution of Surveyors"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="license_name">License/Certification Name *</Label>
              <Input
                id="license_name"
                value={formData.license_name}
                onChange={(e) =>
                  setFormData({ ...formData, license_name: e.target.value })
                }
                placeholder="Full name of your professional license or certification"
                required
              />
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={
                !formData.verifier_type ||
                !formData.license_number ||
                !formData.issuing_authority ||
                !formData.license_name
              }
              className="w-full"
            >
              Continue to License Details
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              License Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue_date">Issue Date *</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) =>
                    setFormData({ ...formData, issue_date: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="expiry_date">Expiry Date *</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expiry_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep(1)} variant="outline">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!formData.issue_date || !formData.expiry_date}
                className="flex-1"
              >
                Continue to Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileTextIcon className="h-5 w-5" />
              Document Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="documents">Upload Supporting Documents *</Label>
              <p className="text-sm text-gray-600 mb-2">
                Please upload your professional license, certifications, and any
                other relevant documents
              </p>
              <Input
                id="documents"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {formData.documents.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Selected Files:</h4>
                <ul className="space-y-1">
                  {formData.documents.map((file, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-center gap-2"
                    >
                      <FileTextIcon className="h-4 w-4" />
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} variant="outline">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={formData.documents.length === 0 || submitting}
                className="flex-1"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Application Submitted!
            </h3>
            <p className="text-gray-600 mb-6">
              Your verifier application has been submitted successfully. Our
              team will review your credentials and notify you once the
              verification process is complete.
            </p>
            <p className="text-sm text-gray-500">
              This process typically takes 3-5 business days.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
