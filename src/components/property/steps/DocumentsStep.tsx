"use client";

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { SkipForward } from "lucide-react";
import { DocumentUpload } from "../DocumentUpload";

interface DocumentsStepProps {
  form: UseFormReturn<any>;
}

interface UploadedDocument {
  type: string;
  name: string;
  url: string;
  path: string;
  size: number;
  hash?: string;
  mime_type?: string;
}

const DOCUMENT_TYPES = [
  { type: "deed", label: "Property Deed", required: true },
  { type: "survey", label: "Survey Report", required: true },
  { type: "certificate", label: "Title Certificate", required: false },
  { type: "tax_clearance", label: "Tax Clearance", required: false },
  { type: "other", label: "Other Documents", required: false },
];

export function DocumentsStep({ form }: DocumentsStepProps) {
  const documents = form.watch("documents") || [];
  const { deleteFile, isUploading, uploadProgress } = useSupabaseStorage();

  const removeDocument = async (index: number) => {
    const doc = documents[index];
    if (doc?.path) {
      try {
        await deleteFile("property-documents", doc.path);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }

    const updatedDocs = documents.filter((_: any, i: number) => i !== index);
    form.setValue("documents", updatedDocs);
  };

  const getDocumentsByType = (type: string) => {
    return documents.filter((doc: UploadedDocument) => doc.type === type);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header with Skip Option */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Property Documents</h2>
          <p className="text-gray-600">
            Upload important documents for your property. This step is optional
            but recommended for better verification.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            // Skip the documents step by setting empty array
            form.setValue("documents", []);
          }}
          className="flex items-center gap-2"
        >
          <SkipForward className="h-4 w-4" />
          Skip for Now
        </Button>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      <DocumentUpload
        propertyId={form.getValues("id")}
        onDocumentUploaded={(document) => {
          form.setValue("documents", [...documents, document]);
        }}
      />
    </div>
  );
}
