import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  FileTextIcon,
  CloudArrowUpIcon,
  WarningIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";

export function KYCUploadForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const { uploadFile } = useSupabaseStorage();

  const documentTypes = [
    { value: "passport", label: "International Passport" },
    { value: "national_id", label: "National ID Card" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "voters_card", label: "Voter's Registration Card" },
    { value: "utility_bill", label: "Utility Bill" },
    { value: "bank_statement", label: "Bank Statement" },
  ];

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!user) return;

    setUploading(true);
    try {
      // Create a simple hash for the file
      const fileHash = await createFileHash(file);

      // For now, we'll simulate the upload by creating a URL
      // In production, you'd upload to Supabase Storage
      const { url } = await uploadFile(file, {
        bucket: "kyc-documents",
        folder: user.id,
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["application/pdf", "image/jpeg", "image/png"],
        generateThumbnail: false,
      });

      const { error } = await supabase.from("kyc_documents").insert({
        user_id: user.id,
        document_type: documentType,
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

      // Refresh documents list
      fetchDocuments();
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

  const fetchDocuments = async () => {
    if (!user) return;

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

  // Fetch documents on component mount
  useState(() => {
    fetchDocuments();
  });

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

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudArrowUpIcon className="h-5 w-5" />
            Upload KYC Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="document-type">Document Type</Label>
              <Select>
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  const documentType = "national_id"; // You'd get this from the select
                  if (file) {
                    handleFileUpload(file, documentType);
                  }
                }}
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Accepted formats: PDF, JPG, JPEG, PNG</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
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
                      {doc.verification_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            KYC Verification Process
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • Upload clear, readable copies of your identification documents
            </li>
            <li>
              • Our verification team will review your documents within 24-48
              hours
            </li>
            <li>
              • You'll receive a notification once your documents are verified
            </li>
            <li>
              • Verified users gain access to investment and tokenization
              features
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
