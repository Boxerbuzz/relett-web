
'use client';

import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X } from 'lucide-react';

interface DocumentsStepProps {
  form: UseFormReturn<any>;
}

export function DocumentsStep({ form }: DocumentsStepProps) {
  const documents = form.watch('documents') || [];

  const addDocument = (type: string) => {
    // Simulate file upload - in real app, integrate with Supabase Storage
    const newDoc = {
      type,
      filename: `${type}_document.pdf`,
      url: `https://example.com/docs/${Date.now()}.pdf`
    };
    form.setValue('documents', [...documents, newDoc]);
  };

  const removeDocument = (index: number) => {
    const updatedDocs = documents.filter((_: any, i: number) => i !== index);
    form.setValue('documents', updatedDocs);
  };

  const documentTypes = [
    { type: 'deed', label: 'Property Deed', required: true },
    { type: 'survey', label: 'Survey Report', required: true },
    { type: 'certificate', label: 'Title Certificate', required: false },
    { type: 'other', label: 'Other Documents', required: false }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Upload Property Documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add legal documents to verify property ownership and details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentTypes.map(({ type, label, required }) => (
          <Card key={type} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {label}
                </span>
                {required && <Badge variant="destructive" className="text-xs">Required</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={() => addDocument(type)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload {label}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded Documents</h4>
          {documents.map((doc: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">{doc.filename}</p>
                  <p className="text-xs text-gray-500 capitalize">{doc.type.replace('_', ' ')}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDocument(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
