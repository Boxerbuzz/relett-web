
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PropertyData {
  basicInfo: {
    title: string;
    description: string;
    propertyType: string;
    category: string;
    status: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: { lat: number; lng: number } | null;
  };
  documents: {
    titleDeed: File | null;
    surveyPlan: File | null;
    taxClearance: File | null;
    other: File[];
  };
  valuation: {
    estimatedValue: number;
    currency: string;
    valuationMethod: string;
    marketAnalysis: string;
  };
}

export function usePropertyCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const createProperty = async (propertyData: PropertyData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          title: propertyData.basicInfo.title,
          description: propertyData.basicInfo.description,
          type: propertyData.basicInfo.propertyType,
          category: propertyData.basicInfo.category,
          status: propertyData.basicInfo.status,
          location: propertyData.location,
          specification: {},
          price: {
            amount: propertyData.valuation.estimatedValue,
            currency: propertyData.valuation.currency
          }
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      const { error: workflowError } = await supabase
        .from('property_creation_workflows')
        .insert({
          user_id: user.id,
          property_id: property.id,
          current_step: 5,
          step_data: JSON.parse(JSON.stringify(propertyData)),
          status: 'completed'
        });

      if (workflowError) throw workflowError;

      if (propertyData.documents.titleDeed || propertyData.documents.surveyPlan) {
        await uploadDocuments(property.id, propertyData.documents);
      }

      toast({
        title: 'Property Created Successfully',
        description: 'Your property has been submitted for verification.',
      });

      return property;
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: 'Error',
        description: 'Failed to create property. Please try again.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocuments = async (propertyId: string, documents: PropertyData['documents']) => {
    const documentsToUpload = [
      { file: documents.titleDeed, type: 'deed', name: 'Title Deed' },
      { file: documents.surveyPlan, type: 'survey', name: 'Survey Plan' },
      { file: documents.taxClearance, type: 'tax_clearance', name: 'Tax Clearance' },
      ...documents.other.map((file, index) => ({ file, type: 'other', name: `Document ${index + 1}` }))
    ].filter(doc => doc.file);

    for (const doc of documentsToUpload) {
      if (!doc.file) continue;

      const fileName = `${propertyId}/${doc.type}_${Date.now()}_${doc.file.name}`;
      
      const { error } = await supabase
        .from('property_documents')
        .insert({
          property_id: propertyId,
          document_type: doc.type as any,
          document_name: doc.name,
          file_url: `placeholder_${fileName}`,
          file_size: doc.file.size,
          mime_type: doc.file.type,
          document_hash: `hash_${Date.now()}`,
          status: 'pending'
        });

      if (error) {
        console.error('Error uploading document:', error);
      }
    }
  };

  return {
    createProperty,
    isLoading
  };
}
