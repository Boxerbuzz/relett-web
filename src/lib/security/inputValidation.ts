import DOMPurify from 'dompurify';

/**
 * Comprehensive input validation and sanitization utilities
 * Part of security fix implementation
 */

export class InputValidator {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target'],
      ALLOW_DATA_ATTR: false,
    });
  }

  /**
   * Sanitize plain text input
   */
  static sanitizeText(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/data:text\/html/gi, '')
      .trim();
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Nigerian format)
   */
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate property ID format
   */
  static validateUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Validate numeric input within range
   */
  static validateNumericRange(value: number, min: number, max: number): boolean {
    return !isNaN(value) && value >= min && value <= max;
  }

  /**
   * Sanitize search query
   */
  static sanitizeSearchQuery(query: string): string {
    return this.sanitizeText(query)
      .replace(/[<>\"'%;()&+]/g, '')
      .substring(0, 100); // Limit length
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: File, allowedTypes: string[], maxSize: number): {
    valid: boolean;
    error?: string;
  } {
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large' };
    }

    return { valid: true };
  }

  /**
   * Escape SQL-like characters for safe text search
   */
  static escapeSqlLike(text: string): string {
    return text.replace(/[%_\\]/g, '\\$&');
  }
}

/**
 * Security-focused form validation utilities
 */
export class SecureFormValidator {
  /**
   * Validate and sanitize contact form data
   */
  static validateContactForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
  }): {
    valid: boolean;
    sanitized?: typeof data;
    errors?: string[];
  } {
    const errors: string[] = [];
    
    // Validate required fields
    if (!data.firstName?.trim()) errors.push('First name is required');
    if (!data.lastName?.trim()) errors.push('Last name is required');
    if (!data.email?.trim()) errors.push('Email is required');
    if (!data.message?.trim()) errors.push('Message is required');

    // Validate formats
    if (data.email && !InputValidator.validateEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.phone && !InputValidator.validatePhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Sanitize all inputs
    const sanitized = {
      firstName: InputValidator.sanitizeText(data.firstName),
      lastName: InputValidator.sanitizeText(data.lastName),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.replace(/\s/g, ''),
      message: InputValidator.sanitizeText(data.message),
    };

    return { valid: true, sanitized };
  }

  /**
   * Validate property listing data
   */
  static validatePropertyData(data: any): {
    valid: boolean;
    sanitized?: any;
    errors?: string[];
  } {
    const errors: string[] = [];

    // Required fields
    if (!data.title?.trim()) errors.push('Property title is required');
    if (!data.description?.trim()) errors.push('Property description is required');
    if (!InputValidator.validateNumericRange(data.price, 1, 10000000000)) {
      errors.push('Invalid price range');
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Sanitize data
    const sanitized = {
      ...data,
      title: InputValidator.sanitizeText(data.title),
      description: InputValidator.sanitizeHtml(data.description),
    };

    return { valid: true, sanitized };
  }
}