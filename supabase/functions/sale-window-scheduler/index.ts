import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[SALE-WINDOW-SCHEDULER] Starting sale window check...');

    const now = new Date().toISOString();

    // 1. Activate sales that should start now
    const { data: toActivate, error: activateError } = await supabaseClient
      .from('tokenized_properties')
      .update({ 
        status: 'sale_active',
        updated_at: now 
      })
      .eq('status', 'token_created')
      .lte('sale_start_date', now)
      .select('id, token_name, sale_start_date');

    if (activateError) {
      console.error('[SALE-WINDOW-SCHEDULER] Error activating sales:', activateError);
    } else if (toActivate && toActivate.length > 0) {
      console.log(`[SALE-WINDOW-SCHEDULER] Activated ${toActivate.length} token sales:`, toActivate.map(t => t.token_name));
    }

    // 2. Close sales that have ended
    const { data: toClose, error: closeError } = await supabaseClient
      .from('tokenized_properties')
      .select('id, token_name, sale_end_date')
      .eq('status', 'sale_active')
      .lte('sale_end_date', now);

    if (closeError) {
      console.error('[SALE-WINDOW-SCHEDULER] Error querying sales to close:', closeError);
    } else if (toClose && toClose.length > 0) {
      console.log(`[SALE-WINDOW-SCHEDULER] Found ${toClose.length} sales to close:`, toClose.map(t => t.token_name));
      
      // Close each sale by calling the close-sales-window function
      for (const property of toClose) {
        try {
          const { error: closeWindowError } = await supabaseClient.functions.invoke('close-sales-window', {
            body: { tokenizedPropertyId: property.id }
          });
          
          if (closeWindowError) {
            console.error(`[SALE-WINDOW-SCHEDULER] Error closing sale for ${property.token_name}:`, closeWindowError);
          } else {
            console.log(`[SALE-WINDOW-SCHEDULER] Successfully closed sale for ${property.token_name}`);
          }
        } catch (error) {
          console.error(`[SALE-WINDOW-SCHEDULER] Exception closing sale for ${property.token_name}:`, error);
        }
      }
    }

    // 3. Log summary
    const activatedCount = toActivate?.length || 0;
    const closedCount = toClose?.length || 0;
    
    console.log(`[SALE-WINDOW-SCHEDULER] Summary: Activated ${activatedCount} sales, closed ${closedCount} sales`);

    return new Response(
      JSON.stringify({
        success: true,
        activated: activatedCount,
        closed: closedCount,
        timestamp: now
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('[SALE-WINDOW-SCHEDULER] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});