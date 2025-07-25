import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useIdentityVerification } from "@/hooks/useIdentityVerification";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { KYCVerificationStatus } from "./KYCVerificationStatus";
import { IdentityDataForm } from "./IdentityDataForm";
import {
  FileTextIcon,
  WarningIcon,
  CheckCircleIcon,
  XIcon,
  CloudArrowUpIcon,
} from "@phosphor-icons/react";
import { VerificationStatus } from "@/types/database";
import { capitalize } from "@/lib/utils";

export function KYCUploadForm() {
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocType, setSelectedDocType] = useState("");
  const { uploadFile } = useSupabaseStorage();
  const { verifications, loading, isVerified, hasAnyVerification } =
    useIdentityVerification();

  const documentTypes = [
    { value: "passport", label: "International Passport" },
    { value: "national_id", label: "National ID Card" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "voters_card", label: "Voter's Registration Card" },
    { value: "utility_bill", label: "Utility Bill" },
    { value: "bank_statement", label: "Bank Statement" },
  ];

  // Get the general verification status (not type-specific)
  const verificationStatus: VerificationStatus =
    verifications.length > 0
      ? verifications[0].verification_status || "unverified"
      : "unverified";

  const canUploadDocuments =
    hasAnyVerification() && verificationStatus !== "verified";
  const showIdentityForm =
    !hasAnyVerification() && verificationStatus === "unverified";

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, []);

  const fetchDocuments = async () => {
    if (!user) return;

    await refreshUserData();

    try {
      const { data, error } = await supabase
        .from("kyc_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedDocType) {
      toast({
        title: "Missing Information",
        description: "Please select a document type and file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileHash = await createFileHash(file);

      const { url } = await uploadFile(file, {
        bucket: "kyc-documents",
        path: user.id,
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["application/pdf", "image/jpeg", "image/png"],
        generateThumbnail: false,
      });

      const { error } = await supabase.from("kyc_documents").insert({
        user_id: user.id,
        document_type: selectedDocType,
        file_url: url,
        file_hash: fileHash,
        file_size: file.size,
        mime_type: file.type,
        verification_status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Document Uploaded",
        description: "Your KYC document has been uploaded for review",
      });

      fetchDocuments();
      setSelectedDocType("");

      // Reset file input
      if (e.target) {
        e.target.value = "";
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const createFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const removeDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from("kyc_documents")
        .delete()
        .eq("id", documentId)
        .eq("user_id", user?.id || "");

      if (error) throw error;

      toast({
        title: "Document Removed",
        description: "Document has been removed successfully",
      });

      fetchDocuments();
    } catch (error) {
      console.error("Error removing document:", error);
      toast({
        title: "Error",
        description: "Failed to remove document",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <WarningIcon className="h-5 w-5 text-red-600" />;
      default:
        return <FileTextIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-800 bg-green-100";
      case "rejected":
        return "text-red-800 bg-red-100";
      default:
        return "text-yellow-800 bg-yellow-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      <KYCVerificationStatus
        status={verificationStatus}
        hasDocuments={documents.length > 0}
        hasIdentityVerification={hasAnyVerification()}
      />

      {/* Identity Data Form - Show only if no verification exists */}
      {showIdentityForm && (
        <IdentityDataForm
          onSuccess={fetchDocuments}
          disabled={verificationStatus.toLowerCase() === "verified"}
        />
      )}

      {/* Document Upload Form - Show only if identity verification exists and not verified */}
      {canUploadDocuments && documents.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudArrowUpIcon className="h-5 w-5" />
              Upload Supporting Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="document-type">Document Type</Label>
                <Select
                  value={selectedDocType}
                  onValueChange={setSelectedDocType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="document-file">Choose File</Label>
                <Input
                  id="document-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={uploading || !selectedDocType}
                />
              </div>
            </div>

            {uploading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Uploading document...</p>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p>Accepted formats: PDF, JPG, JPEG, PNG</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(doc.verification_status)}
                    <div>
                      <p className="font-medium capitalize">
                        {doc.document_type.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        doc.verification_status
                      )}`}
                    >
                      {capitalize(doc.verification_status)}
                    </span>
                    {(doc.verification_status === "rejected" ||
                      verificationStatus !== "verified") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            KYC Verification Process
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • Provide your identity information and upload clear, readable
              documents
            </li>
            <li>
              • Our verification team reviews submissions within 24-48 hours
            </li>
            <li>
              • You'll receive notifications about your verification status
            </li>
            <li>
              • Verified users gain access to investment and tokenization
              features
            </li>
            {verificationStatus === "rejected" && (
              <li className="text-red-700 font-medium">
                • Your submission was rejected. Please review feedback and
                resubmit.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
