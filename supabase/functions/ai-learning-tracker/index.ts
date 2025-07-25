
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface LearningData {
  user_id: string;
  interaction_data: any;
  patterns_discovered?: any[];
  behavior_updates?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, interaction_data, patterns_discovered, behavior_updates }: LearningData = await req.json();
    
    if (!user_id || !interaction_data) {
      return new Response(
        JSON.stringify({ error: 'user_id and interaction_data are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing learning data for user:', user_id);

    // Store patterns discovered
    if (patterns_discovered && patterns_discovered.length > 0) {
      for (const pattern of patterns_discovered) {
        const { error: patternError } = await supabase
          .from('learning_patterns')
          .upsert({
            user_id,
            pattern_type: pattern.type,
            pattern_data: pattern.data,
            confidence_score: pattern.confidence,
            usage_count: 1,
            success_rate: pattern.success_rate || 0.5,
            last_applied_at: new Date().toISOString()
          }, { 
            onConflict: 'user_id,pattern_type',
            ignoreDuplicates: false 
          });

        if (patternError) {
          console.error('Error storing pattern:', patternError);
        } else {
          console.log('Stored pattern:', pattern.type);
        }
      }
    }

    // Update behavior profile
    if (behavior_updates) {
      const { error: profileError } = await supabase
        .from('user_behavior_profiles')
        .upsert({
          user_id,
          profile_type: behavior_updates.profile_type || 'general',
          confidence_score: behavior_updates.confidence_score || 0.5,
          characteristics: behavior_updates.characteristics || {},
          preferences: behavior_updates.preferences || {},
          interaction_style: behavior_updates.interaction_style,
          optimal_response_length: behavior_updates.optimal_response_length,
          preferred_communication_time: behavior_updates.preferred_communication_time || [],
          last_updated: new Date().toISOString()
        }, { 
          onConflict: 'user_id,profile_type',
          ignoreDuplicates: false 
        });

      if (profileError) {
        console.error('Error updating behavior profile:', profileError);
      } else {
        console.log('Updated behavior profile for user:', user_id);
      }
    }

    // Analyze interaction for new patterns
    const analysisResult = await analyzeInteractionPatterns(user_id, interaction_data);

    return new Response(JSON.stringify({
      success: true,
      message: 'Learning data processed successfully',
      patterns_stored: patterns_discovered?.length || 0,
      profile_updated: !!behavior_updates,
      analysis_result: analysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-learning-tracker:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeInteractionPatterns(userId: string, interactionData: any) {
  try {
    // Get recent interactions for pattern analysis
    const { data: recentInteractions } = await supabase
      .from('agent_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!recentInteractions || recentInteractions.length < 3) {
      return { patterns_detected: 0, message: 'Insufficient data for pattern analysis' };
    }

    const patterns = [];

    // Analyze communication style
    const messages = recentInteractions.map(i => i.user_message).join(' ').toLowerCase();
    const formalWords = ['please', 'thank you', 'could you', 'would you'];
    const casualWords = ['hey', 'hi', 'yeah', 'ok', 'sure'];
    
    const formalCount = formalWords.reduce((count, word) => count + (messages.match(new RegExp(word, 'g')) || []).length, 0);
    const casualCount = casualWords.reduce((count, word) => count + (messages.match(new RegExp(word, 'g')) || []).length, 0);
    
    if (formalCount > casualCount * 1.5) {
      patterns.push({
        type: 'communication_style',
        data: { style: 'formal', confidence: Math.min(0.9, formalCount / (formalCount + casualCount)) },
        confidence: Math.min(0.9, formalCount / (formalCount + casualCount))
      });
    } else if (casualCount > formalCount * 1.5) {
      patterns.push({
        type: 'communication_style',
        data: { style: 'casual', confidence: Math.min(0.9, casualCount / (formalCount + casualCount)) },
        confidence: Math.min(0.9, casualCount / (formalCount + casualCount))
      });
    }

    // Analyze response time preferences
    const responseTimes = recentInteractions
      .filter(i => i.response_time_ms)
      .map(i => i.response_time_ms);
    
    if (responseTimes.length > 5) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const preferenceType = avgResponseTime < 1000 ? 'fast' : avgResponseTime < 3000 ? 'medium' : 'detailed';
      
      patterns.push({
        type: 'response_preference',
        data: { 
          preferred_speed: preferenceType, 
          avg_response_time: avgResponseTime 
        },
        confidence: 0.7
      });
    }

    // Analyze inquiry patterns
    const inquiryTypes = recentInteractions.map(i => i.interaction_type);
    const typeCount = inquiryTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantType = Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (dominantType && dominantType[1] > inquiryTypes.length * 0.4) {
      patterns.push({
        type: 'inquiry_preference',
        data: { 
          primary_interest: dominantType[0],
          frequency: dominantType[1] / inquiryTypes.length 
        },
        confidence: dominantType[1] / inquiryTypes.length
      });
    }

    // Store discovered patterns
    for (const pattern of patterns) {
      await supabase
        .from('learning_patterns')
        .upsert({
          user_id: userId,
          pattern_type: pattern.type,
          pattern_data: pattern.data,
          confidence_score: pattern.confidence,
          usage_count: 1,
          success_rate: 0.5
        }, { onConflict: 'user_id,pattern_type' });
    }

    return {
      patterns_detected: patterns.length,
      patterns: patterns,
      message: 'Pattern analysis completed'
    };

  } catch (error) {
    console.error('Error in pattern analysis:', error);
    return { error: error.message };
  }
}
