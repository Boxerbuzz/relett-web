import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
  XIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { useToast } from "@/hooks/use-toast";
import { calculateFileHash } from "@/utils/fileHash";

interface DocumentUploadProps {
  propertyId?: string;
  onDocumentUploaded?: (document: UploadedDocument) => void;
  maxFiles?: number;
  requiredTypes?: string[];
  onDocumentDeleted?: (documentId: string) => void;
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
  required?: boolean;
  hash?: string;
  mime_type?: string;
}

const DOCUMENT_TYPES = [
  {
    key: "deed",
    label: "Property Deed",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png, .webp",
  },
  {
    key: "survey",
    label: "Survey Report",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png, .webp",
  },
  {
    key: "certificate_of_occupancy",
    label: "C of O",
    required: false,
    accept: ".pdf,.jpg,.jpeg,.png, .webp",
  },
  {
    key: "tax_clearance",
    label: "Tax Clearance",
    required: false,
    accept: ".pdf,.jpg,.jpeg,.png, .webp",
  },
  {
    key: "other",
    label: "Other Documents",
    required: false,
    accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx, .webp",
  },
];

export function DocumentUpload({
  propertyId,
  onDocumentUploaded,
  maxFiles = 10,
  requiredTypes = ["deed", "survey"],
  onDocumentDeleted,
}: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const { uploadFile, deleteFile, isUploading, uploadProgress } =
    useSupabaseStorage();
  const { toast } = useToast();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    docType: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB for documents)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await uploadFile(file, {
        bucket: "property-documents",
        path: propertyId ? `${propertyId}/${docType}` : `temp/${docType}`,
        maxSize: 10 * 1024 * 1024,
        allowedTypes: [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/webp",
          "application/msword",
        ],
      });

      const newDocument: UploadedDocument = {
        id: crypto.randomUUID(),
        name: file.name,
        hash: await calculateFileHash(file),
        type: docType,
        url: result.url,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        required: requiredTypes.includes(docType),
        mime_type: result.type,
      };

      setDocuments((prev) => [...prev, newDocument]);
      onDocumentUploaded?.(newDocument);
    } catch (error) {
      console.error("Upload failed:", error);
    }

    // Reset input
    event.target.value = "";
  };

  const handleRemoveDocument = async (documentId: string, url: string) => {
    try {
      // Extract path from URL for deletion
      const urlParts = url.split("/");
      const pathIndex = urlParts.findIndex(
        (part) => part === "property-documents"
      );
      if (pathIndex !== -1) {
        const path = urlParts.slice(pathIndex + 1).join("/");
        await deleteFile("property-documents", path);
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

      onDocumentDeleted?.(documentId);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const getDocumentTypeStatus = (docType: string) => {
    const hasDocument = documents.some((doc) => doc.type === docType);
    const isRequired = requiredTypes.includes(docType);

    if (hasDocument) return "uploaded";
    if (isRequired) return "required";
    return "optional";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const allRequiredUploaded = requiredTypes.every((type) =>
    documents.some((doc) => doc.type === type)
  );

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Property Documents</span>
          <Badge variant={allRequiredUploaded ? "default" : "destructive"} className="w-fit">
            {documents.filter((doc) => doc.required).length}/
            {requiredTypes.length} Required
          </Badge>
        </CardTitle>
        <CardDescription>
          Upload the necessary documents to verify your property ownership
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Document Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {DOCUMENT_TYPES.map((docType) => {
            const status = getDocumentTypeStatus(docType.key);
            const hasDocument = documents.some(
              (doc) => doc.type === docType.key
            );

            return (
              <Card
                key={docType.key}
                className={`cursor-pointer transition-all ${
                  status === "uploaded"
                    ? "border-green-500 bg-green-50"
                    : status === "required"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <CardTitle className="text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="flex items-center gap-2 min-w-0">
                      {status === "uploaded" ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : status === "required" ? (
                        <WarningIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                      ) : (
                        <FileTextIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{docType.label}</span>
                    </span>
                    {docType.required && (
                      <Badge
                        variant={hasDocument ? "default" : "destructive"}
                        className="text-xs w-fit"
                      >
                        Required
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  {!hasDocument ? (
                    <label className="block">
                      <input
                        type="file"
                        className="hidden"
                        accept={docType.accept}
                        onChange={(e) => handleFileSelect(e, docType.key)}
                        disabled={isUploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 sm:h-10 text-sm"
                        disabled={isUploading}
                        asChild
                      >
                        <div className="flex items-center justify-center">
                          <UploadIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Upload {docType.label}</span>
                        </div>
                      </Button>
                    </label>
                  ) : (
                    <div className="text-center">
                      <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-900">
                        Uploaded
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">
              Uploaded Documents ({documents.length})
            </h4>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg bg-gray-50 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileTextIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-600">
                        <span className="capitalize">
                          {doc.type.replace("_", " ")}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formatFileSize(doc.size)}</span>
                        {doc.required && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.url, "_blank")}
                      className="h-8 px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline">View</span>
                      <span className="sm:hidden">👁️</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.id, doc.url)}
                      className="text-red-600 hover:text-red-700 h-8 px-2 sm:px-3"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <WarningIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            Upload Guidelines
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All documents must be clear and legible</li>
            <li>• Accepted formats: PDF, JPG, PNG, WebP (max 10MB each)</li>
            <li>
              • Required documents must be uploaded before property submission
            </li>
            <li>
              • Documents will be verified by our team within 2-3 business days
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
