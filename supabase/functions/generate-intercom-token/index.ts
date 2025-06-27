import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createCorsResponse,
  createResponse,
  verifyUser,
  corsHeaders,
} from "../shared/supabase-client.ts";
import { create } from "djwt";

const INTERCOM_SECRET = Deno.env.get("INTERCOM_SECRET_KEY");

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  if (req.method !== "POST") {
    return createResponse(
      {
        success: false,
        error: "Method not allowed",
      },
      405
    );
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get("authorization");
    const userResult = await verifyUser(authHeader!);

    if (!userResult.success) {
      return createResponse(userResult, 401);
    }

    const user = userResult.data;

    if (!INTERCOM_SECRET) {
      return createResponse(
        {
          success: false,
          error: "Intercom secret key not configured",
        },
        500
      );
    }

    // Create Intercom JWT payload with only necessary, non-sensitive data
    const payload = {
      user_id: user.id,
      iat: Math.floor(Date.now() / 1000), // issued at
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // expires in 1 hour
    };

    // Generate JWT for Intercom
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(INTERCOM_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const intercomToken = await create(
      { alg: "HS256", typ: "JWT" },
      payload,
      key
    );

    return createResponse({
      success: true,
      data: {
        intercom_token: intercomToken,
        user_id: user.id,
      },
      message: "Intercom token generated successfully",
    });
  } catch (error) {
    console.error("Error generating Intercom token:", error);
    return createResponse(
      {
        success: false,
        error: "Failed to generate Intercom token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});
