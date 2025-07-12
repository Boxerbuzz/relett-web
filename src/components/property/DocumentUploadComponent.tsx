'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface DocumentUploadComponentProps {
  propertyId: string;
  onDocumentUploaded?: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  documentType: string;
  documentName: string;
}

const DOCUMENT_TYPES = [
  { value: 'deed', label: 'Property Deed' },
  { value: 'survey', label: 'Survey Plan' },
  { value: 'certificate_of_occupancy', label: 'Certificate of Occupancy' },
  { value: 'government_consent', label: 'Government Consent' },
  { value: 'tax_clearance', label: 'Tax Clearance Certificate' },
  { value: 'building_plan', label: 'Building Plan Approval' },
  { value: 'environmental_clearance', label: 'Environmental Clearance' },
  { value: 'other', label: 'Other Document' }
];

export function DocumentUploadComponent({ propertyId, onDocumentUploaded }: DocumentUploadComponentProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [defaultDocumentType, setDefaultDocumentType] = useState('deed');
  const { toast } = useToast();
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
      documentType: defaultDocumentType,
      documentName: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
    }));

    setUploadingFiles(prev => [...prev, ...newUploads]);

    // Start uploading each file
    newUploads.forEach((upload, index) => {
      uploadDocument(upload, uploadingFiles.length + index);
    });
  }, [defaultDocumentType, uploadingFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const uploadDocument = async (uploadFile: UploadingFile, index: number) => {
    try {
      const fileExt = uploadFile.file.name.split('.').pop();
      const fileName = `${propertyId}/${uploadFile.documentType}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-documents')
        .upload(fileName, uploadFile.file);

      // Simulate progress for UI feedback
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 20;
        setUploadingFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, progress } : f
        ));
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 100);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-documents')
        .getPublicUrl(fileName);

      // Create document record in database
      const { error: dbError } = await supabase
        .from('property_documents')
        .insert({
          property_id: propertyId,
          document_name: uploadFile.documentName,
          document_type: uploadFile.documentType as any,
          file_url: publicUrl,
          file_size: uploadFile.file.size,
          mime_type: uploadFile.file.type,
          status: 'pending',
          document_hash: fileName // Use filename as hash for now
        });

      if (dbError) throw dbError;

      // Update status to completed
      setUploadingFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'completed', progress: 100 } : f
      ));

      toast({
        title: 'Success',
        description: `${uploadFile.documentName} uploaded successfully`
      });

      onDocumentUploaded?.();

    } catch (error) {
      console.error('Upload error:', error);
      
      setUploadingFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error' } : f
      ));

      toast({
        title: 'Upload Failed',
        description: `Failed to upload ${uploadFile.documentName}`,
        variant: 'destructive'
      });
    }
  };

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateDocumentType = (index: number, documentType: string) => {
    setUploadingFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, documentType } : f
    ));
  };

  const updateDocumentName = (index: number, documentName: string) => {
    setUploadingFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, documentName } : f
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Default Document Type Selector */}
        <div>
          <Label htmlFor="defaultDocType">Default Document Type</Label>
          <Select value={defaultDocumentType} onValueChange={setDefaultDocumentType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag & drop documents here, or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, DOC, DOCX, and images up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Uploading Files */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Uploading Documents</h4>
            {uploadingFiles.map((uploadFile, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {uploadFile.file.name}
                    </span>
                    {uploadFile.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {uploadFile.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadingFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {uploadFile.status === 'uploading' && (
                  <Progress value={uploadFile.progress} className="w-full" />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`docType-${index}`}>Document Type</Label>
                    <Select 
                      value={uploadFile.documentType} 
                      onValueChange={(value) => updateDocumentType(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`docName-${index}`}>Document Name</Label>
                    <Input
                      id={`docName-${index}`}
                      value={uploadFile.documentName}
                      onChange={(e) => updateDocumentName(index, e.target.value)}
                      placeholder="Enter document name"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}