
import { BaseAgent, AgentContext, AgentResponse } from './BaseAgent';
import { ReservationAgent } from './ReservationAgent';

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    this.registerAgent(new ReservationAgent());
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
      return await agent.processMessage(message, context);
    } catch (error) {
      console.error(`Error processing message with agent ${agentId}:`, error);
      return {
        message: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        metadata: { error: true }
      };
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
