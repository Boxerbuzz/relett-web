
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Database } from '../types/database.types.ts';

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Create typed Supabase client factory
export function createTypedSupabaseClient() {
  return createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

// Create authenticated client from request
export function createAuthenticatedClient(authHeader: string) {
  return createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );
}

// Error handling utilities
export function handleSupabaseError(error: unknown): ErrorResponse {
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as SupabaseError;
    return {
      success: false,
      error: supabaseError.message,
      details: supabaseError.details || supabaseError.hint,
    };
  }
  
  if (typeof error === 'string') {
    return {
      success: false,
      error,
    };
  }
  
  return {
    success: false,
    error: 'An unknown error occurred',
    details: error ? String(error) : undefined,
  };
}

export function createSuccessResponse<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function createErrorResponse(error: string, details?: string): ErrorResponse {
  return {
    success: false,
    error,
    details,
  };
}

// Authentication helper
export async function verifyUser(authHeader: string) {
  if (!authHeader) {
    return createErrorResponse('Missing authorization header');
  }

  const client = createAuthenticatedClient(authHeader);
  const { data: { user }, error } = await client.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (error || !user) {
    return createErrorResponse('Unauthorized', error?.message);
  }

  return createSuccessResponse(user);
}

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Response helpers
export function createResponse<T>(response: ApiResponse<T>, status = 200): Response {
  return new Response(JSON.stringify(response), {
    status: response.success ? status : status >= 400 ? status : 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function createCorsResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}
