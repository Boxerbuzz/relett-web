
import { BaseAgent, AgentConfig, AgentContext, AgentResponse } from './BaseAgent';

export class ReservationAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      id: 'reservation-agent',
      name: 'Reservation Assistant',
      description: 'Handles property reservation requests and booking inquiries',
      enabled: true,
      systemPrompt: `You are a helpful reservation assistant for a property platform. 
        You help users with booking properties, checking availability, and managing reservations.
        You can:
        - Check property availability
        - Process reservation requests
        - Provide booking information
        - Help with cancellations and modifications
        Always be professional and helpful.`,
      capabilities: [
        'check_availability',
        'create_reservation',
        'modify_reservation',
        'cancel_reservation',
        'send_confirmation'
      ]
    };
    super(config);
  }

  async processMessage(message: string, context: AgentContext): Promise<AgentResponse> {
    const lowerMessage = message.toLowerCase();
    
    // Simple intent detection
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve')) {
      return this.handleBookingIntent(message, context);
    } else if (lowerMessage.includes('cancel')) {
      return this.handleCancellationIntent(message, context);
    } else if (lowerMessage.includes('available') || lowerMessage.includes('availability')) {
      return this.handleAvailabilityIntent(message, context);
    } else {
      return this.handleGeneralInquiry(message, context);
    }
  }

  private async handleBookingIntent(message: string, context: AgentContext): Promise<AgentResponse> {
    return {
      message: "I'd be happy to help you with your reservation! To get started, I'll need some details:\n\n" +
               "• Check-in and check-out dates\n" +
               "• Number of guests\n" +
               "• Any special requirements\n\n" +
               "Could you please provide these details?",
      actions: [
        {
          type: 'request_booking_details',
          payload: { propertyId: context.propertyId }
        }
      ]
    };
  }

  private async handleCancellationIntent(message: string, context: AgentContext): Promise<AgentResponse> {
    return {
      message: "I can help you with cancellation. Please provide your reservation ID or booking reference, " +
               "and I'll look up your booking details and cancellation policy.",
      actions: [
        {
          type: 'request_reservation_id',
          payload: { userId: context.userId }
        }
      ]
    };
  }

  private async handleAvailabilityIntent(message: string, context: AgentContext): Promise<AgentResponse> {
    return {
      message: "Let me check the availability for you. What dates are you interested in? " +
               "Please provide your preferred check-in and check-out dates.",
      actions: [
        {
          type: 'check_availability',
          payload: { propertyId: context.propertyId }
        }
      ]
    };
  }

  private async handleGeneralInquiry(message: string, context: AgentContext): Promise<AgentResponse> {
    return {
      message: "Hello! I'm your reservation assistant. I can help you with:\n\n" +
               "• Making new reservations\n" +
               "• Checking property availability\n" +
               "• Modifying existing bookings\n" +
               "• Cancellation requests\n\n" +
               "How can I assist you today?"
    };
  }
}
