
import { BaseAgent, AgentConfig, AgentContext, AgentResponse } from './BaseAgent';
import { supabase } from '@/integrations/supabase/client';

export interface LearningContext extends AgentContext {
  userBehaviorProfile?: UserBehaviorProfile;
  conversationHistory?: AgentInteraction[];
  learningPatterns?: LearningPattern[];
}

export interface UserBehaviorProfile {
  id: string;
  user_id: string;
  profile_type: string;
  confidence_score: number;
  characteristics: Record<string, any>;
  preferences: Record<string, any>;
  interaction_style: 'formal' | 'casual' | 'brief' | 'detailed';
  optimal_response_length: 'short' | 'medium' | 'long';
  preferred_communication_time: string[];
}

export interface LearningPattern {
  id: string;
  user_id: string;
  pattern_type: string;
  pattern_data: Record<string, any>;
  confidence_score: number;
  usage_count: number;
  success_rate: number;
}

export interface AgentInteraction {
  id: string;
  user_id: string;
  agent_id: string;
  conversation_id?: string;
  property_id?: string;
  interaction_type: string;
  user_message: string;
  agent_response: string;
  response_time_ms?: number;
  user_satisfaction_score?: number;
  outcome?: string;
  context_data: Record<string, any>;
  created_at: string;
}

export abstract class LearningAgent extends BaseAgent {
  protected learningContext: LearningContext = {};

  async processMessage(
    message: string, 
    context: AgentContext
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    
    // Load user behavior profile and learning patterns
    await this.loadLearningContext(context);
    
    // Analyze user intent and current context
    const intent = await this.analyzeUserIntent(message, context);
    
    // Generate personalized response using learned patterns
    const response = await this.generatePersonalizedResponse(message, context, intent);
    
    const responseTime = Date.now() - startTime;
    
    // Track this interaction for learning
    await this.trackInteraction(message, response, context, responseTime, intent);
    
    // Update conversation context
    await this.updateConversationContext(context, intent);
    
    return response;
  }

  protected async loadLearningContext(context: AgentContext): Promise<void> {
    if (!context.userId) return;

    try {
      // Load user behavior profile
      const { data: profile } = await supabase
        .from('user_behavior_profiles')
        .select('*')
        .eq('user_id', context.userId)
        .maybeSingle();

      // Load recent learning patterns
      const { data: patterns } = await supabase
        .from('learning_patterns')
        .select('*')
        .eq('user_id', context.userId)
        .order('confidence_score', { ascending: false })
        .limit(10);

      // Load recent conversation history
      const { data: history } = await supabase
        .from('agent_interactions')
        .select('*')
        .eq('user_id', context.userId)
        .eq('agent_id', this.config.id)
        .order('created_at', { ascending: false })
        .limit(5);

      this.learningContext = {
        ...context,
        userBehaviorProfile: profile || undefined,
        learningPatterns: patterns || [],
        conversationHistory: history || []
      };
    } catch (error) {
      console.error('Error loading learning context:', error);
    }
  }

  protected async analyzeUserIntent(message: string, context: AgentContext): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Use learning patterns to improve intent detection
    const patterns = this.learningContext.learningPatterns || [];
    const intentPatterns = patterns.filter(p => p.pattern_type === 'intent');
    
    // Basic intent detection with learning enhancement
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve')) {
      return 'booking_intent';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'pricing_inquiry';
    } else if (lowerMessage.includes('location') || lowerMessage.includes('where')) {
      return 'location_inquiry';
    } else if (lowerMessage.includes('available') || lowerMessage.includes('availability')) {
      return 'availability_check';
    } else {
      // Use learned patterns to detect intent
      for (const pattern of intentPatterns) {
        const keywords = pattern.pattern_data.keywords || [];
        if (keywords.some((keyword: string) => lowerMessage.includes(keyword.toLowerCase()))) {
          return pattern.pattern_data.intent || 'general_inquiry';
        }
      }
      return 'general_inquiry';
    }
  }

  protected async generatePersonalizedResponse(
    message: string, 
    context: AgentContext, 
    intent: string
  ): Promise<AgentResponse> {
    const profile = this.learningContext.userBehaviorProfile;
    const patterns = this.learningContext.learningPatterns || [];
    
    // Get response style preferences
    const responseStyle = profile?.interaction_style || 'casual';
    const responseLength = profile?.optimal_response_length || 'medium';
    
    // Find successful response patterns for this intent
    const responsePatterns = patterns.filter(p => 
      p.pattern_type === 'response_style' && 
      p.pattern_data.intent === intent &&
      p.success_rate > 0.7
    );

    // Generate base response using parent class
    const baseResponse = await this.generateBaseResponse(message, context, intent);
    
    // Personalize the response based on learned preferences
    let personalizedMessage = baseResponse.message;
    
    if (responseStyle === 'formal') {
      personalizedMessage = this.makeFormal(personalizedMessage);
    } else if (responseStyle === 'brief') {
      personalizedMessage = this.makeBrief(personalizedMessage);
    }
    
    if (responseLength === 'short') {
      personalizedMessage = this.shortenResponse(personalizedMessage);
    } else if (responseLength === 'long') {
      personalizedMessage = this.expandResponse(personalizedMessage, intent);
    }

    // Add personalized recommendations based on patterns
    const recommendations = await this.getPersonalizedRecommendations(context, intent);
    
    return {
      message: personalizedMessage,
      actions: [...(baseResponse.actions || []), ...recommendations],
      metadata: {
        ...baseResponse.metadata,
        personalization_applied: true,
        user_profile_type: profile?.profile_type,
        response_style: responseStyle,
        intent_detected: intent
      }
    };
  }

  protected abstract generateBaseResponse(
    message: string, 
    context: AgentContext, 
    intent: string
  ): Promise<AgentResponse>;

  protected async getPersonalizedRecommendations(
    context: AgentContext, 
    intent: string
  ): Promise<any[]> {
    const recommendations = [];
    const patterns = this.learningContext.learningPatterns || [];
    
    // Find preference patterns
    const preferencePatterns = patterns.filter(p => p.pattern_type === 'preference');
    
    for (const pattern of preferencePatterns) {
      if (pattern.confidence_score > 0.6) {
        const recommendation = {
          type: 'personalized_suggestion',
          payload: {
            suggestion: pattern.pattern_data.suggestion,
            confidence: pattern.confidence_score,
            based_on: pattern.pattern_data.based_on
          }
        };
        recommendations.push(recommendation);
      }
    }
    
    return recommendations;
  }

  protected makeFormal(message: string): string {
    return message
      .replace(/hey/gi, 'Hello')
      .replace(/hi/gi, 'Good day')
      .replace(/yeah/gi, 'Yes')
      .replace(/okay/gi, 'Certainly')
      .replace(/sure/gi, 'Of course');
  }

  protected makeBrief(message: string): string {
    // Remove filler words and shorten sentences
    return message
      .replace(/I'd be happy to help you/gi, 'Sure')
      .replace(/Please let me know if you have any questions/gi, 'Questions?')
      .replace(/Is there anything else I can help you with/gi, 'Anything else?');
  }

  protected shortenResponse(message: string): string {
    const sentences = message.split('. ');
    return sentences.slice(0, Math.max(1, Math.floor(sentences.length / 2))).join('. ');
  }

  protected expandResponse(message: string, intent: string): string {
    const expansions = {
      booking_intent: ' I can also help you with scheduling inspections, checking availability for specific dates, and providing detailed information about the property amenities.',
      pricing_inquiry: ' Additionally, I can provide information about financing options, market comparisons, and potential return on investment.',
      location_inquiry: ' I can also share details about nearby amenities, transportation links, schools, and neighborhood characteristics.'
    };
    
    return message + (expansions[intent as keyof typeof expansions] || '');
  }

  protected async trackInteraction(
    userMessage: string,
    agentResponse: AgentResponse,
    context: AgentContext,
    responseTime: number,
    intent: string
  ): Promise<void> {
    if (!context.userId) return;

    try {
      await supabase.rpc('track_agent_interaction', {
        p_user_id: context.userId,
        p_agent_id: this.config.id,
        p_conversation_id: context.conversationId || null,
        p_property_id: context.propertyId || null,
        p_interaction_type: intent,
        p_user_message: userMessage,
        p_agent_response: agentResponse.message,
        p_response_time_ms: responseTime,
        p_context_data: {
          metadata: agentResponse.metadata,
          personalization_applied: agentResponse.metadata?.personalization_applied || false,
          actions_count: agentResponse.actions?.length || 0
        }
      });
    } catch (error) {
      console.error('Error tracking agent interaction:', error);
    }
  }

  protected async updateConversationContext(
    context: AgentContext, 
    intent: string
  ): Promise<void> {
    if (!context.userId || !context.conversationId) return;

    try {
      const contextData = {
        current_intent: intent,
        last_interaction_time: new Date().toISOString(),
        session_data: context.metadata || {}
      };

      await supabase.rpc('update_conversation_context', {
        p_user_id: context.userId,
        p_agent_id: this.config.id,
        p_conversation_id: context.conversationId,
        p_context_data: contextData,
        p_current_intent: intent
      });
    } catch (error) {
      console.error('Error updating conversation context:', error);
    }
  }

  // Method to provide feedback for learning
  async provideFeedback(
    interactionId: string, 
    satisfactionScore: number, 
    outcome: string
  ): Promise<void> {
    try {
      await supabase
        .from('agent_interactions')
        .update({
          user_satisfaction_score: satisfactionScore,
          outcome: outcome,
          updated_at: new Date().toISOString()
        })
        .eq('id', interactionId);
    } catch (error) {
      console.error('Error providing feedback:', error);
    }
  }
}
