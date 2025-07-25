
import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { ReservationAgent } from './ReservationAgent';
import { AdaptivePropertyAgent } from './AdaptivePropertyAgent';

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    this.registerAgent(new ReservationAgent());
    this.registerAgent(new AdaptivePropertyAgent());
    // Add other agents as they're implemented
  }

  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.getConfig().id, agent);
  }

  async processMessage(
    agentId: string,
    message: string,
    context: AgentContext
  ): Promise<AgentResponse | null> {
    const agent = this.agents.get(agentId);
    
    if (!agent || !agent.isEnabled()) {
      return null;
    }

    try {
      const response = await agent.processMessage(message, context);
      
      // Track learning data for adaptive agents
      if (agentId === 'adaptive-property-agent' && context.userId) {
        await this.trackLearningData(context.userId, message, response, context);
      }
      
      return response;
    } catch (error) {
      console.error(`Error processing message with agent ${agentId}:`, error);
      return {
        message: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        metadata: { error: true }
      };
    }
  }

  private async trackLearningData(
    userId: string,
    userMessage: string,
    agentResponse: AgentResponse,
    context: AgentContext
  ): Promise<void> {
    try {
      // Call the learning tracker edge function
      const response = await fetch('https://wossuijahchhtjzphsgh.supabase.co/functions/v1/ai-learning-tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvc3N1aWphaGNoaHRqenBoc2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjA5NjIsImV4cCI6MjA2MTQ5Njk2Mn0.eLKZrNi8hMUCAqyoHaw5TMaX8muaA7q_Q7HCHzBDSyM'}`
        },
        body: JSON.stringify({
          user_id: userId,
          interaction_data: {
            user_message: userMessage,
            agent_response: agentResponse.message,
            context: context,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        console.error('Failed to track learning data:', response.statusText);
      }
    } catch (error) {
      console.error('Error tracking learning data:', error);
    }
  }

  getAvailableAgents(): Array<{ id: string; name: string; description: string }> {
    return Array.from(this.agents.values())
      .filter(agent => agent.isEnabled())
      .map(agent => {
        const config = agent.getConfig();
        return {
          id: config.id,
          name: config.name,
          description: config.description
        };
      });
  }

  getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }
}

// Singleton instance
export const agentManager = new AgentManager();
