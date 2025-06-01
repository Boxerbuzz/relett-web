
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  propertyId?: string;
  onDocumentUploaded?: (document: any) => void;
  maxFiles?: number;
  requiredTypes?: string[];
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
  required?: boolean;
}

const DOCUMENT_TYPES = [
  { key: 'deed', label: 'Property Deed', required: true, accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'survey', label: 'Survey Plan', required: true, accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'certificate', label: 'Certificate of Occupancy', required: false, accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'tax_clearance', label: 'Tax Clearance', required: false, accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'other', label: 'Other Documents', required: false, accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx' }
];

export function DocumentUpload({ 
  propertyId, 
  onDocumentUploaded, 
  maxFiles = 10,
  requiredTypes = ['deed', 'survey']
}: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const { uploadFile, deleteFile, isUploading, uploadProgress } = useFileUpload();
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await uploadFile(file, {
        bucket: 'property-documents',
        path: propertyId ? `property-${propertyId}` : 'temp',
        maxSize: 10 * 1024 * 1024,
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      });

      const newDocument: UploadedDocument = {
        id: crypto.randomUUID(),
        name: file.name,
        type: docType,
        url: result.url,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        required: requiredTypes.includes(docType)
      };

      setDocuments(prev => [...prev, newDocument]);
      onDocumentUploaded?.(newDocument);

    } catch (error) {
      console.error('Upload failed:', error);
    }

    // Reset input
    event.target.value = '';
  };

  const handleRemoveDocument = async (documentId: string, url: string) => {
    try {
      // Extract path from URL for deletion
      const urlParts = url.split('/');
      const path = urlParts.slice(-2).join('/'); // Get last two parts of path
      
      await deleteFile('property-documents', path);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const getDocumentTypeStatus = (docType: string) => {
    const hasDocument = documents.some(doc => doc.type === docType);
    const isRequired = requiredTypes.includes(docType);
    
    if (hasDocument) return 'uploaded';
    if (isRequired) return 'required';
    return 'optional';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allRequiredUploaded = requiredTypes.every(type => 
    documents.some(doc => doc.type === type)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Property Documents
          <Badge variant={allRequiredUploaded ? 'default' : 'destructive'}>
            {documents.filter(doc => doc.required).length}/{requiredTypes.length} Required
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCUMENT_TYPES.map((docType) => {
            const status = getDocumentTypeStatus(docType.key);
            const hasDocument = documents.some(doc => doc.type === docType.key);

            return (
              <Card key={docType.key} className={`cursor-pointer transition-all ${
                status === 'uploaded' ? 'border-green-500 bg-green-50' :
                status === 'required' ? 'border-red-500 bg-red-50' :
                'border-gray-200 hover:border-gray-300'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {status === 'uploaded' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : status === 'required' ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-400" />
                      )}
                      {docType.label}
                    </span>
                    {docType.required && (
                      <Badge variant={hasDocument ? 'default' : 'destructive'} className="text-xs">
                        Required
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                        className="w-full"
                        disabled={isUploading}
                        asChild
                      >
                        <div>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload {docType.label}
                        </div>
                      </Button>
                    </label>
                  ) : (
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-900">Uploaded</p>
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
            <h4 className="font-medium">Uploaded Documents ({documents.length})</h4>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.size)}</span>
                        {doc.required && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.id, doc.url)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
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
            <AlertTriangle className="w-4 h-4 mr-2" />
            Upload Guidelines
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All documents must be clear and legible</li>
            <li>• Accepted formats: PDF, JPG, PNG (max 10MB each)</li>
            <li>• Required documents must be uploaded before property submission</li>
            <li>• Documents will be verified by our team within 2-3 business days</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
