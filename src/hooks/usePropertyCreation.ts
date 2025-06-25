
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
    landmark?: string;
    postal_code?: string;
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }>;
  valuation: {
    estimatedValue: number;
    currency: string;
    valuationMethod: string;
    marketAnalysis: string;
  };
  specification?: any;
  price?: any;
  features?: string[];
  amenities?: string[];
  images?: any[];
  sub_type?: string;
  condition?: string;
  max_guest?: number;
  tags?: string[];
  is_exclusive?: boolean;
  is_featured?: boolean;
  sqrft?: string;
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
          sub_type: propertyData.sub_type,
          category: propertyData.basicInfo.category,
          condition: propertyData.condition,
          status: propertyData.basicInfo.status,
          location: propertyData.location,
          specification: propertyData.specification || {},
          price: propertyData.price || {
            amount: propertyData.valuation.estimatedValue,
            currency: propertyData.valuation.currency
          },
          sqrft: propertyData.sqrft || '',
          max_guest: propertyData.max_guest || 0,
          features: propertyData.features || [],
          amenities: propertyData.amenities || [],
          tags: propertyData.tags || [],
          is_exclusive: propertyData.is_exclusive || false,
          is_featured: propertyData.is_featured || false,
          garages: propertyData.specification?.garages || 0
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

      // Store uploaded documents in property_documents table
      if (propertyData.documents && propertyData.documents.length > 0) {
        await storePropertyDocuments(property.id, propertyData.documents);
      }

      // Store images
      if (propertyData.images && propertyData.images.length > 0) {
        const imageInserts = propertyData.images.map(img => ({
          property_id: property.id,
          url: img.url,
          is_primary: img.is_primary,
          category: img.category
        }));

        const { error: imageError } = await supabase
          .from('property_images')
          .insert(imageInserts);

        if (imageError) {
          console.error('Error storing images:', imageError);
        }
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

  const storePropertyDocuments = async (propertyId: string, documents: PropertyData['documents']) => {
    for (const doc of documents) {
      const { error } = await supabase
        .from('property_documents')
        .insert({
          property_id: propertyId,
          document_type: doc.type as any,
          document_name: doc.name,
          file_url: doc.url,
          file_size: doc.size,
          mime_type: 'application/pdf', // Default, should be detected during upload
          document_hash: `hash_${Date.now()}`, // Should be calculated during upload
          status: 'pending'
        });

      if (error) {
        console.error('Error storing document:', error);
      }
    }
  };

  const createPaymentSession = async (amount: number, purpose: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-session', {
        body: {
          amount,
          currency: 'USD',
          purpose,
          metadata: { timestamp: Date.now() }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Payment session error:', error);
      throw error;
    }
  };

  const tokenizeProperty = async (propertyId: string, tokenDetails: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-hedera-token', {
        body: {
          tokenizedPropertyId: propertyId,
          tokenName: tokenDetails.name,
          tokenSymbol: tokenDetails.symbol,
          totalSupply: tokenDetails.supply
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Tokenization error:', error);
      throw error;
    }
  };

  return {
    createProperty,
    createPaymentSession,
    tokenizeProperty,
    isLoading
  };
}
