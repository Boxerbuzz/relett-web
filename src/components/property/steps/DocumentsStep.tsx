"use client";

import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { FileText, X, Eye, Download, SkipForward } from "lucide-react";
import { DocumentUpload } from "../DocumentUpload";

interface DocumentsStepProps {
  form: UseFormReturn<any>;
}

interface UploadedDocument {
  type: string;
  filename: string;
  url: string;
  path: string;
  size: number;
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
  const [selectedDocType, setSelectedDocType] = useState<string>("deed");
  const { uploadFile, deleteFile, isUploading, uploadProgress } =
    useSupabaseStorage();

  const handleFilesSelected = async (files: File[]) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadFile(file, {
          bucket: "property-documents",
          folder: selectedDocType,
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/jpg",
          ],
        });

        return {
          type: selectedDocType,
          filename: file.name,
          url: result.url,
          path: result.path,
          size: result.size,
        };
      });

      const uploadedDocs = await Promise.all(uploadPromises);
      const updatedDocs = [...documents, ...uploadedDocs];
      form.setValue("documents", updatedDocs);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

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
        onDocumentUploaded={() => {}}
      />

      {/* Uploaded Documents by Type */}
      <div className="space-y-4">
        {DOCUMENT_TYPES.map(({ type, label }) => {
          const typeDocuments = getDocumentsByType(type);
          if (typeDocuments.length === 0) return null;

          return (
            <Card key={type}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  {label}
                  <Badge variant="outline">{typeDocuments.length} files</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {typeDocuments.map((doc: UploadedDocument, index: number) => {
                    const globalIndex = documents.findIndex(
                      (d: UploadedDocument) =>
                        d.url === doc.url && d.type === doc.type
                    );

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">
                              {doc.filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(doc.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.url, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = doc.url;
                              link.download = doc.filename;
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(globalIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
