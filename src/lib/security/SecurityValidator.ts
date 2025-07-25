import { z } from 'zod';

export class SecurityValidator {
  // Trading validation schemas
  static tradeRequestSchema = z.object({
    tokenizedPropertyId: z.string().uuid(),
    tokenAmount: z.number().positive().max(1000000),
    pricePerToken: z.number().positive().max(10000000),
    tradeType: z.enum(['buy', 'sell']),
    orderType: z.enum(['market', 'limit']),
    userId: z.string().uuid()
  });

  static governanceVoteSchema = z.object({
    pollId: z.string().uuid(),
    voterId: z.string().uuid(),
    option: z.string().min(1).max(100),
    votingPower: z.number().positive().max(100)
  });

  static tokenTransferSchema = z.object({
    fromAccountId: z.string().min(1),
    toAccountId: z.string().min(1),
    tokenId: z.string().min(1),
    amount: z.number().positive().max(1000000),
    memo: z.string().optional()
  });

  // Rate limiting
  private static rateLimits = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(userId: string, action: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const key = `${userId}-${action}`;
    const now = Date.now();
    const limit = this.rateLimits.get(key);

    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  }

  // Input sanitization
  static sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  // Transaction validation
  static validateTransactionData(data: any, schema: z.ZodSchema): { success: boolean; data?: any; errors?: string[] } {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return { success: false, errors: ['Invalid data format'] };
    }
  }

  // Verify user permissions
  static verifyUserPermission(userRole: string, requiredPermissions: string[]): boolean {
    const rolePermissions: Record<string, string[]> = {
      admin: ['trade', 'governance', 'management', 'verification'],
      investor: ['trade', 'governance'],
      agent: ['trade', 'management'],
      verifier: ['verification'],
      landowner: ['management', 'governance']
    };

    const userPermissions = rolePermissions[userRole.toLowerCase()] || [];
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }

  // Audit log entry
  static createAuditEntry(userId: string, action: string, resourceId: string, details: any) {
    return {
      userId,
      action,
      resourceId,
      details: this.sanitizeAuditDetails(details),
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      ipAddress: 'masked' // IP would be captured server-side
    };
  }

  private static sanitizeAuditDetails(details: any): any {
    if (typeof details !== 'object' || details === null) return details;
    
    const sanitized = { ...details };
    
    // Remove sensitive fields
    delete sanitized.privateKey;
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.signature;
    
    // Mask partial data
    if (sanitized.accountId) {
      sanitized.accountId = this.maskSensitiveData(sanitized.accountId);
    }
    
    return sanitized;
  }

  static maskSensitiveData(data: string): string {
    if (data.length <= 8) return '*'.repeat(data.length);
    return data.substring(0, 4) + '*'.repeat(data.length - 8) + data.substring(data.length - 4);
  }
}