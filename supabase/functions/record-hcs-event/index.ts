import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import {
  Client,
  TopicMessageSubmitTransaction,
  AccountId,
  PrivateKey,
  Hbar
} from "https://esm.sh/@hashgraph/sdk@2.65.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HCSEventRequest {
  eventType: string;
  propertyId?: string;
  tokenizedPropertyId?: string;
  eventData: any;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventType, propertyId, tokenizedPropertyId, eventData, userId }: HCSEventRequest = await req.json();

    if (!eventType || !eventData) {
      throw new Error('Event type and event data are required');
    }

    console.log(`Recording HCS event: ${eventType}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the appropriate HCS topic
    let hcsTopicRecord = null;
    let hcsTopicId = null;
    
    if (tokenizedPropertyId) {
      const { data: hcsTopic, error: topicError } = await supabase
        .from('hcs_topics')
        .select('*')
        .eq('tokenized_property_id', tokenizedPropertyId)
        .single();
      
      if (!topicError && hcsTopic) {
        hcsTopicRecord = hcsTopic;
        hcsTopicId = hcsTopic.topic_id; // Use the actual Hedera topic ID
      }
    }

    if (!hcsTopicId) {
      throw new Error('HCS topic not found for this tokenized property');
    }

    // Create comprehensive event record
    const eventRecord = {
      eventType,
      propertyId,
      tokenizedPropertyId,
      userId,
      timestamp: new Date().toISOString(),
      data: eventData
    };

    // Initialize Hedera client
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID')!;
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY')!;
    
    if (!hederaAccountId || !hederaPrivateKey) {
      throw new Error('Hedera credentials not configured');
    }

    const client = Client.forTestnet();
    client.setOperator(AccountId.fromString(hederaAccountId), PrivateKey.fromString(hederaPrivateKey));

    console.log(`Submitting message to HCS topic: ${hcsTopicId}`);
    
    // Submit message to HCS topic
    const messageContent = JSON.stringify(eventRecord);
    const messageSubmitTx = new TopicMessageSubmitTransaction()
      .setTopicId(hcsTopicId)
      .setMessage(messageContent)
      .setMaxTransactionFee(new Hbar(2));

    const messageSubmit = await messageSubmitTx.execute(client);
    const messageReceipt = await messageSubmit.getReceipt(client);
    
    const transactionId = messageSubmit.transactionId.toString();
    const consensusTimestamp = messageReceipt.consensusTimestamp?.toDate().toISOString() || new Date().toISOString();
    
    console.log(`Message submitted with Transaction ID: ${transactionId}`);
    
    // Close Hedera client
    client.close();

    // Store audit event in database
    const { error: auditError } = await supabase
      .from('audit_events')
      .insert({
        event_type: eventType,
        event_data: eventRecord,
        hcs_topic_id: hcsTopicRecord?.id || null, // Use the database ID, not the Hedera topic ID
        transaction_id: transactionId,
        consensus_timestamp: consensusTimestamp
      });

    if (auditError) {
      console.error('Error storing audit event:', auditError);
      throw new Error(`Failed to store audit event: ${auditError.message}`);
    }

    console.log(`Successfully recorded ${eventType} event on HCS`);

    return new Response(
      JSON.stringify({
        success: true,
        eventType,
        transactionId,
        consensusTimestamp,
        message: 'Event successfully recorded on HCS'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('HCS event recording failed:', error);
    
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