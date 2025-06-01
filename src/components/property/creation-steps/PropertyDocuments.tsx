
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PropertyDocumentsProps {
  data: {
    titleDeed: File | null;
    surveyPlan: File | null;
    taxClearance: File | null;
    other: File[];
  };
  onUpdate: (data: any) => void;
}

interface DocumentType {
  key: keyof PropertyDocumentsProps['data'];
  label: string;
  required: boolean;
  description: string;
  acceptedFormats: string[];
}

const documentTypes: DocumentType[] = [
  {
    key: 'titleDeed',
    label: 'Title Deed',
    required: true,
    description: 'Official document proving ownership of the property',
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  },
  {
    key: 'surveyPlan',
    label: 'Survey Plan',
    required: true,
    description: 'Detailed survey plan showing property boundaries',
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  },
  {
    key: 'taxClearance',
    label: 'Tax Clearance Certificate',
    required: false,
    description: 'Proof of tax payments (recommended)',
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  }
];

export function PropertyDocuments({ data, onUpdate }: PropertyDocumentsProps) {
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (documentKey: keyof PropertyDocumentsProps['data'], file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select a file smaller than 10MB.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF, JPG, or PNG file.',
        variant: 'destructive'
      });
      return;
    }

    if (documentKey === 'other') {
      onUpdate({ other: [...data.other, file] });
    } else {
      onUpdate({ [documentKey]: file });
    }

    toast({
      title: 'File Added',
      description: `${file.name} has been uploaded successfully.`,
    });
  };

  const handleFileRemove = (documentKey: keyof PropertyDocumentsProps['data'], index?: number) => {
    if (documentKey === 'other' && typeof index === 'number') {
      const newOther = data.other.filter((_, i) => i !== index);
      onUpdate({ other: newOther });
    } else {
      onUpdate({ [documentKey]: null });
    }
  };

  const handleDrop = (e: React.DragEvent, documentKey: keyof PropertyDocumentsProps['data']) => {
    e.preventDefault();
    setDraggedOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(documentKey, files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (documentKey: string) => {
    setDraggedOver(documentKey);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const FileUploadArea = ({ docType }: { docType: DocumentType }) => {
    const currentFile = data[docType.key] as File | null;
    const isDragged = draggedOver === docType.key;

    return (
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-all ${
          isDragged 
            ? 'border-blue-500 bg-blue-50' 
            : currentFile 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 bg-gray-50'
        }`}
        onDrop={(e) => handleDrop(e, docType.key)}
        onDragOver={handleDragOver}
        onDragEnter={() => handleDragEnter(docType.key)}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            {currentFile ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          {currentFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">{currentFile.name}</span>
              </div>
              <p className="text-xs text-gray-600">{formatFileSize(currentFile.size)}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFileRemove(docType.key)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-3 h-3 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Drop your {docType.label.toLowerCase()} here, or{' '}
                <label className="text-blue-600 cursor-pointer hover:text-blue-700">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(docType.key, file);
                    }}
                  />
                </label>
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: {docType.acceptedFormats.join(', ')} (max 10MB)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Documents</CardTitle>
        <CardDescription>
          Upload the necessary documents to verify your property ownership
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {documentTypes.map((docType) => (
          <div key={docType.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">{docType.label}</Label>
                  {docType.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">{docType.description}</p>
              </div>
            </div>
            <FileUploadArea docType={docType} />
          </div>
        ))}

        {/* Additional Documents */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Additional Documents</Label>
            <p className="text-xs text-gray-600">
              Upload any other relevant documents (optional)
            </p>
          </div>
          
          {data.other.length > 0 && (
            <div className="space-y-2">
              {data.other.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileRemove('other', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-center">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <label className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                Add Additional Document
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect('other', file);
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Document Requirements Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Document Requirements
          </h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• All documents must be clear and legible</li>
            <li>• Scanned copies or high-quality photos are acceptable</li>
            <li>• Documents will be verified by our team within 2-3 business days</li>
            <li>• You may be contacted if additional documentation is required</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
