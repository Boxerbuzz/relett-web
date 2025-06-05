'use client';

import { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { FileText, X, Eye, Download } from 'lucide-react';

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
  { type: 'deed', label: 'Property Deed', required: true },
  { type: 'survey', label: 'Survey Report', required: true },
  { type: 'certificate', label: 'Title Certificate', required: false },
  { type: 'tax_clearance', label: 'Tax Clearance', required: false },
  { type: 'other', label: 'Other Documents', required: false }
];

export function DocumentsStep({ form }: DocumentsStepProps) {
  const documents = form.watch('documents') || [];
  const [selectedDocType, setSelectedDocType] = useState<string>('deed');
  const { uploadFile, deleteFile, isUploading, uploadProgress } = useSupabaseStorage();

  const handleFilesSelected = async (files: File[]) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadFile(file, {
          bucket: 'property-documents',
          folder: selectedDocType,
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
        });

        return {
          type: selectedDocType,
          filename: file.name,
          url: result.url,
          path: result.path,
          size: result.size
        };
      });

      const uploadedDocs = await Promise.all(uploadPromises);
      const updatedDocs = [...documents, ...uploadedDocs];
      form.setValue('documents', updatedDocs);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const removeDocument = async (index: number) => {
    const doc = documents[index];
    if (doc?.path) {
      try {
        await deleteFile('property-documents', doc.path);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
    
    const updatedDocs = documents.filter((_: any, i: number) => i !== index);
    form.setValue('documents', updatedDocs);
  };

  const getDocumentsByType = (type: string) => {
    return documents.filter((doc: UploadedDocument) => doc.type === type);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Document Type Selection */}
      <div>
        <h3 className="text-lg font-medium mb-4">Select Document Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DOCUMENT_TYPES.map(({ type, label, required }) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedDocType(type)}
              className={`p-3 border rounded-lg text-left transition-colors ${
                selectedDocType === type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getDocumentsByType(type).length} uploaded
                  </p>
                </div>
                {required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div>
        <h4 className="font-medium mb-2">
          Upload {DOCUMENT_TYPES.find(d => d.type === selectedDocType)?.label}
        </h4>
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          accept={{
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
          }}
          maxFiles={5}
          maxSize={10 * 1024 * 1024}
          disabled={isUploading}
        />
        
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </div>

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
                    const globalIndex = documents.findIndex((d: UploadedDocument) => 
                      d.url === doc.url && d.type === doc.type
                    );
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">{doc.filename}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
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

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Upload Guidelines
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All documents must be clear and legible</li>
          <li>• Accepted formats: PDF, JPG, PNG (max 10MB each)</li>
          <li>• Required documents must be uploaded before property submission</li>
          <li>• Documents will be verified by our team within 2-3 business days</li>
        </ul>
      </div>
    </div>
  );
}
