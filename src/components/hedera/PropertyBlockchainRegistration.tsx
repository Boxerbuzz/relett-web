
'use client';

import { useState } from 'react';
import { usePropertyContracts } from '@/contexts/PropertyContractContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PropertyBlockchainData } from '@/lib/contracts';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Shield,
  Link as LinkIcon
} from 'lucide-react';

interface PropertyBlockchainRegistrationProps {
  propertyData: {
    id: string;
    title: string;
    description?: string;
    type: string;
    sub_type?: string;
    category?: string;
    condition?: string;
    location: any;
    price: any;
    specification?: any;
    features?: string[];
    amenities?: string[];
    tags?: string[];
  };
  onRegistrationComplete?: (transactionId: string) => void;
  onRegistrationSkip?: () => void;
  autoRegister?: boolean;
}

export function PropertyBlockchainRegistration({ 
  propertyData, 
  onRegistrationComplete,
  onRegistrationSkip,
  autoRegister = false
}: PropertyBlockchainRegistrationProps) {
  const { registerProperty, isConnected, isLoading: contractsLoading } = usePropertyContracts();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRegisterProperty = async () => {
    if (!isConnected) {
      toast({
        title: 'Connection Error',
        description: 'Hedera contracts are not connected. Please check your configuration.',
        variant: 'destructive'
      });
      return;
    }

    setIsRegistering(true);
    setRegistrationStatus(null);

    try {
      // Get comprehensive property data including documents
      const propertyDetails = await fetchPropertyDetails(propertyData.id);
      
      // Validate that documents with hashes exist
      if (propertyDetails.documentHashes.length === 0) {
        toast({
          title: 'No Documents Found',
          description: 'Property documents with valid hashes are required for blockchain registration.',
          variant: 'destructive'
        });
        setIsRegistering(false);
        return;
      }
      
      const blockchainData: PropertyBlockchainData = {
        propertyId: propertyData.id,
        title: propertyData.title,
        description: propertyData.description || '',
        type: propertyData.type,
        subType: propertyData.sub_type || '',
        category: propertyData.category || '',
        condition: propertyData.condition || '',
        location: {
          address: propertyData.location?.address || '',
          city: propertyData.location?.city || '',
          state: propertyData.location?.state || '',
          country: propertyData.location?.country || '',
          coordinates: propertyData.location?.coordinates,
          landmark: propertyData.location?.landmark,
          postal_code: propertyData.location?.postal_code,
        },
        specification: propertyData.specification || {},
        price: {
          amount: propertyData.price?.amount || 0,
          currency: propertyData.price?.currency || 'NGN',
          term: propertyData.price?.term || 'month',
          deposit: propertyData.price?.deposit,
          service_charge: propertyData.price?.service_charge,
          is_negotiable: propertyData.price?.is_negotiable || false,
        },
        features: propertyData.features || [],
        amenities: propertyData.amenities || [],
        tags: propertyData.tags || [],
        documentHashes: propertyDetails.documentHashes,
        legalInfo: propertyDetails.legalInfo,
        registeredBy: propertyDetails.userId
      };

      const result = await registerProperty(blockchainData);
      
      if (result.success) {
        setRegistrationStatus('success');
        setTransactionId(result.transactionId);
        onRegistrationComplete?.(result.transactionId);
      } else {
        setRegistrationStatus('error');
      }
    } catch (error) {
      console.error('Property registration error:', error);
      setRegistrationStatus('error');
    } finally {
      setIsRegistering(false);
    }
  };

  const fetchPropertyDetails = async (propertyId: string) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch property documents with hashes
    const { data: documents } = await supabase
      .from('property_documents')
      .select('id, document_type, document_name, document_hash')
      .eq('property_id', propertyId);

    // Fetch property information
    const { data: property } = await supabase
      .from('properties')
      .select('user_id')
      .eq('id', propertyId)
      .single();

    const documentHashes = (documents || [])
      .filter(doc => doc.document_hash && doc.document_hash.trim() !== '')
      .map(doc => ({
        documentId: doc.id,
        documentType: doc.document_type || '',
        documentName: doc.document_name || '',
        hash: doc.document_hash || ''
      }));

    const legalInfo = {
      landTitleId: undefined,
      ownershipType: undefined,
      encumbrances: []
    };

    return {
      documentHashes,
      legalInfo,
      userId: user?.id || property?.user_id || ''
    };
  };

  const handleSkip = () => {
    onRegistrationSkip?.();
  };

  if (contractsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Connecting to blockchain...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="w-5 h-5" />
            Blockchain Registration Unavailable
          </CardTitle>
          <CardDescription className="text-orange-700">
            Hedera blockchain contracts are not connected. Your property will be created without blockchain registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSkip} variant="outline">
            Continue Without Blockchain
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Shield className="w-5 h-5" />
          Blockchain Registration
        </CardTitle>
        <CardDescription className="text-blue-700">
          Register your property on the Hedera blockchain for enhanced security and tokenization capabilities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {registrationStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-200 rounded-md">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Registration Successful!</p>
              {transactionId && (
                <p className="text-xs text-green-600 font-mono">
                  Transaction ID: {transactionId}
                </p>
              )}
            </div>
          </div>
        )}

        {registrationStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">
              Registration failed. You can try again or continue without blockchain registration.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Property ID:</span>
            <span className="font-mono text-xs">{propertyData.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Token Symbol:</span>
            <Badge variant="outline">PROP{propertyData.id.slice(-4).toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Network:</span>
            <Badge variant="outline">Hedera Testnet</Badge>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleRegisterProperty}
            disabled={isRegistering || registrationStatus === 'success'}
            className="flex-1"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : registrationStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Registered
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4 mr-2" />
                Register on Blockchain
              </>
            )}
          </Button>
          
          {registrationStatus !== 'success' && (
            <Button 
              onClick={handleSkip}
              variant="outline"
              disabled={isRegistering}
            >
              Skip for Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
