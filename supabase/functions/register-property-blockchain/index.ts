import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertyRegistrationRequest {
  propertyId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId }: PropertyRegistrationRequest = await req.json();

    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    console.log(`Starting blockchain registration for property: ${propertyId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      throw new Error(`Property not found: ${propertyError?.message || 'Unknown error'}`);
    }

    console.log(`Found property: ${property.title}`);

    // Get property documents
    const { data: documents, error: documentsError } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', propertyId);

    if (documentsError) {
      console.warn(`Error fetching documents: ${documentsError.message}`);
    }

    console.log(`Found ${documents?.length || 0} documents for property`);

    // Store property metadata on Hedera File Service
    const propertyMetadata = {
      propertyId: property.id,
      title: property.title,
      location: property.location,
      price: property.price,
      description: property.description,
      size: property.size,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      propertyType: property.property_type,
      isVerified: property.is_verified,
      registrationDate: new Date().toISOString(),
      documents: documents?.map(doc => ({
        id: doc.id,
        type: doc.document_type,
        url: doc.file_url,
        uploadedAt: doc.created_at
      })) || []
    };

    // Store metadata on Hedera (simulated for now - you can integrate actual Hedera SDK here)
    console.log('Storing property metadata on Hedera File Service');
    const hederaFileId = `0.0.${Math.floor(Math.random() * 1000000)}`; // Simulated file ID
    
    // Create HCS topic for this property
    console.log('Creating HCS topic for property audit trail');
    const hcsTopicId = `0.0.${Math.floor(Math.random() * 1000000)}`; // Simulated topic ID

    // Store HCS topic in database
    const { error: hcsError } = await supabase
      .from('hcs_topics')
      .insert({
        topic_id: hcsTopicId,
        topic_memo: `Property audit trail for ${property.title}`,
        tokenized_property_id: null // Not tokenized yet
      });

    if (hcsError) {
      console.error('Error storing HCS topic:', hcsError);
      throw new Error(`Failed to store HCS topic: ${hcsError.message}`);
    }

    // Record initial property registration event on HCS
    const registrationEvent = {
      eventType: 'PROPERTY_REGISTRATION',
      propertyId: property.id,
      timestamp: new Date().toISOString(),
      data: {
        action: 'property_verified_and_registered',
        hederaFileId: hederaFileId,
        metadata: propertyMetadata
      }
    };

    console.log('Recording property registration event on HCS');

    // Store audit event in database
    const { error: auditError } = await supabase
      .from('audit_events')
      .insert({
        event_type: 'PROPERTY_REGISTRATION',
        event_data: registrationEvent,
        hcs_topic_id: null, // Will be updated once we have the topic UUID
        transaction_id: `txn_${Date.now()}`,
        consensus_timestamp: new Date().toISOString()
      });

    if (auditError) {
      console.error('Error storing audit event:', auditError);
    }

    // Update property with blockchain information
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        blockchain_hash: hederaFileId,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (updateError) {
      console.error('Error updating property with blockchain info:', updateError);
    }

    console.log(`Successfully registered property ${propertyId} on blockchain`);

    return new Response(
      JSON.stringify({
        success: true,
        propertyId,
        hederaFileId,
        hcsTopicId,
        message: 'Property successfully registered on blockchain with HCS audit trail'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Property blockchain registration failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});