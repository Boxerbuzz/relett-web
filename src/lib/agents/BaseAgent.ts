
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  systemPrompt: string;
  capabilities: string[];
}

export interface AgentContext {
  userId: string;
  conversationId?: string;
  propertyId?: string;
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  message: string;
  actions?: AgentAction[];
  metadata?: Record<string, any>;
}

export interface AgentAction {
  type: string;
  payload: Record<string, any>;
}

export abstract class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  abstract processMessage(
    message: string, 
    context: AgentContext
  ): Promise<AgentResponse>;

  protected async callOpenAI(
    messages: Array<{ role: string; content: string }>,
    context: AgentContext
  ): Promise<string> {
    // This would be implemented to call the OpenAI API
    // For now, return a placeholder
    return "AI response placeholder";
  }

  protected async executeAction(
    action: AgentAction, 
    context: AgentContext
  ): Promise<void> {
    // Base implementation for common actions
    console.log(`Executing action: ${action.type}`, action.payload);
  }

  public getConfig(): AgentConfig {
    return this.config;
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }
}
