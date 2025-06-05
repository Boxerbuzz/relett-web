
import { LearningAgent, LearningContext } from './LearningAgent';
import { AgentConfig, AgentContext, AgentResponse } from './BaseAgent';

export class AdaptivePropertyAgent extends LearningAgent {
  constructor() {
    const config: AgentConfig = {
      id: 'adaptive-property-agent',
      name: 'Adaptive Property Assistant',
      description: 'AI assistant that learns from user interactions to provide personalized property recommendations and support',
      enabled: true,
      systemPrompt: `You are an intelligent property assistant that learns from user behavior to provide personalized recommendations. 
        You adapt your communication style, response length, and suggestions based on user preferences.
        You help with property searches, bookings, recommendations, and general inquiries.
        Always be helpful and adjust your approach based on what you've learned about the user.`,
      capabilities: [
        'personalized_recommendations',
        'adaptive_communication',
        'behavior_learning',
        'property_search',
        'booking_assistance',
        'market_insights',
        'user_preference_tracking'
      ]
    };
    super(config);
  }

  protected async generateBaseResponse(
    message: string, 
    context: AgentContext, 
    intent: string
  ): Promise<AgentResponse> {
    const profile = this.learningContext.userBehaviorProfile;
    const history = this.learningContext.conversationHistory || [];
    
    switch (intent) {
      case 'booking_intent':
        return this.handleBookingIntent(message, context, profile);
      
      case 'pricing_inquiry':
        return this.handlePricingInquiry(message, context, profile);
      
      case 'location_inquiry':
        return this.handleLocationInquiry(message, context, profile);
      
      case 'availability_check':
        return this.handleAvailabilityCheck(message, context, profile);
      
      default:
        return this.handleGeneralInquiry(message, context, profile);
    }
  }

  private async handleBookingIntent(
    message: string, 
    context: AgentContext, 
    profile?: any
  ): Promise<AgentResponse> {
    const isDecisiveUser = profile?.characteristics?.decision_speed === 'fast';
    const preferencesKnown = profile?.preferences && Object.keys(profile.preferences).length > 0;
    
    let responseMessage = "I'd be happy to help you with your booking! ";
    
    if (isDecisiveUser) {
      responseMessage += "Let's get this done quickly. ";
    }
    
    if (preferencesKnown) {
      const preferences = profile.preferences;
      responseMessage += `Based on your preferences for ${preferences.property_type || 'properties'} `;
      if (preferences.price_range) {
        responseMessage += `in the ${preferences.price_range} range `;
      }
      responseMessage += "I can suggest some great options. ";
    }
    
    responseMessage += "What dates are you looking at, and how many guests?";

    return {
      message: responseMessage,
      actions: [
        {
          type: 'request_booking_details',
          payload: { 
            propertyId: context.propertyId,
            user_profile: profile?.profile_type,
            personalized: true
          }
        }
      ]
    };
  }

  private async handlePricingInquiry(
    message: string, 
    context: AgentContext, 
    profile?: any
  ): Promise<AgentResponse> {
    const isBudgetConscious = profile?.characteristics?.price_sensitivity === 'high';
    const preferredRange = profile?.preferences?.price_range;
    
    let responseMessage = "I can help you with pricing information. ";
    
    if (isBudgetConscious) {
      responseMessage += "I understand you're looking for the best value. ";
    }
    
    if (preferredRange) {
      responseMessage += `I notice you usually look at properties in the ${preferredRange} range. `;
    }
    
    responseMessage += "What specific property or area are you interested in?";

    return {
      message: responseMessage,
      actions: [
        {
          type: 'provide_pricing_info',
          payload: { 
            propertyId: context.propertyId,
            budget_conscious: isBudgetConscious,
            preferred_range: preferredRange
          }
        }
      ]
    };
  }

  private async handleLocationInquiry(
    message: string, 
    context: AgentContext, 
    profile?: any
  ): Promise<AgentResponse> {
    const locationPreferences = profile?.preferences?.preferred_locations || [];
    const commuteConcerns = profile?.characteristics?.commute_important === true;
    
    let responseMessage = "I can help you with location information. ";
    
    if (locationPreferences.length > 0) {
      responseMessage += `I see you've shown interest in ${locationPreferences.join(', ')} before. `;
    }
    
    if (commuteConcerns) {
      responseMessage += "I'll make sure to include transport links and commute times. ";
    }
    
    responseMessage += "What specific location details would you like to know?";

    return {
      message: responseMessage,
      actions: [
        {
          type: 'provide_location_info',
          payload: { 
            propertyId: context.propertyId,
            preferred_locations: locationPreferences,
            include_commute: commuteConcerns
          }
        }
      ]
    };
  }

  private async handleAvailabilityCheck(
    message: string, 
    context: AgentContext, 
    profile?: any
  ): Promise<AgentResponse> {
    const flexibleDates = profile?.characteristics?.date_flexibility === 'high';
    const planningHorizon = profile?.characteristics?.booking_horizon || 'medium';
    
    let responseMessage = "Let me check availability for you. ";
    
    if (flexibleDates) {
      responseMessage += "I can suggest alternative dates if your preferred ones aren't available. ";
    }
    
    if (planningHorizon === 'short') {
      responseMessage += "I'll prioritize immediate availability. ";
    }
    
    responseMessage += "What dates are you considering?";

    return {
      message: responseMessage,
      actions: [
        {
          type: 'check_availability',
          payload: { 
            propertyId: context.propertyId,
            flexible_dates: flexibleDates,
            planning_horizon: planningHorizon
          }
        }
      ]
    };
  }

  private async handleGeneralInquiry(
    message: string, 
    context: AgentContext, 
    profile?: any
  ): Promise<AgentResponse> {
    const interactionStyle = profile?.interaction_style || 'casual';
    const previousQuestions = this.learningContext.conversationHistory
      ?.map(h => h.interaction_type) || [];
    
    let responseMessage = "";
    
    if (interactionStyle === 'formal') {
      responseMessage = "Good day! How may I assist you with your property inquiries today?";
    } else {
      responseMessage = "Hi there! How can I help you with properties today?";
    }
    
    // Add contextual suggestions based on history
    if (previousQuestions.includes('pricing_inquiry')) {
      responseMessage += "\n\nI can help with property searches, pricing, availability, or bookings.";
    } else {
      responseMessage += "\n\nI'm here to help with anything property-related!";
    }

    return {
      message: responseMessage,
      actions: []
    };
  }
}
