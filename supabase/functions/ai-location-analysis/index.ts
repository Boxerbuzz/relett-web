// deno-lint-ignore-file no-explicit-any
import { serve } from "std/http/server.ts";
import {
  createTypedSupabaseClient,
  createSuccessResponse,
  createErrorResponse,
  createResponse,
  createCorsResponse,
} from "../shared/supabase-client.ts";
import { systemLogger } from "../shared/system-logger.ts";

// Types for better type safety
interface LocationAnalysis {
  areaClassification: {
    type: "Urban" | "Suburban" | "Rural";
    description: string;
    characteristics: string[];
  };
  securityAssessment: {
    score: number;
    factors: string[];
    recommendations: string[];
  };
  transportation: {
    score: number;
    publicTransport: string;
    trafficCondition: "Light" | "Moderate" | "Heavy";
    infrastructure: "Good" | "Fair" | "Poor";
  };
  infrastructure: {
    powerSupply: "Stable" | "Intermittent";
    water: "Available" | "Limited";
    internet: "Good" | "Fair" | "Poor";
    waste: "Regular" | "Irregular";
  };
  amenities: {
    education: string[];
    healthcare: string[];
    shopping: string[];
    entertainment: string[];
  };
  economicFactors: {
    employmentScore: number;
    incomeLevel: "High" | "Middle" | "Low";
    commercialActivity: "High" | "Moderate" | "Low";
  };
  futureDevelopment: {
    growthPotential: "High" | "Moderate" | "Low";
    plannedProjects: string[];
    outlook: "Positive" | "Stable" | "Declining";
  };
  environmental: {
    airQuality: "Good" | "Moderate" | "Poor";
    noiseLevel: "Low" | "Moderate" | "High";
    greenSpaces: "Abundant" | "Moderate" | "Limited";
    floodRisk: "Low" | "Moderate" | "High";
  };
  investmentOutlook: {
    appreciationPotential: "High" | "Moderate" | "Low";
    rentalDemand: "High" | "Good" | "Low";
    riskLevel: "Low" | "Medium" | "High";
  };
  overallScore: number;
  summary: string;
}

// Configuration constants
const CONFIG = {
  AI_MODEL: "gpt-4o-mini", // More cost-effective for this use case
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.3,
  TIMEOUT_MS: 30000,
  MAX_RETRIES: 2,
  CACHE_DURATION_HOURS: 24,
  NEARBY_PROPERTIES_LIMIT: 15,
};

// Cache for location analyses
const analysisCache = new Map<string, { data: any; timestamp: number }>();

// Helper function to create cache key
function createCacheKey(propertyId: string, location: any): string {
  return `${propertyId}_${location?.city || ""}_${location?.state || ""}`;
}

// Helper function to check cache
function getCachedAnalysis(cacheKey: string): any | null {
  const cached = analysisCache.get(cacheKey);
  if (!cached) return null;

  const now = Date.now();
  const cacheAge = now - cached.timestamp;
  const maxAge = CONFIG.CACHE_DURATION_HOURS * 60 * 60 * 1000;

  if (cacheAge > maxAge) {
    analysisCache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

// Helper function to cache analysis
function cacheAnalysis(cacheKey: string, data: any): void {
  analysisCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

// Enhanced AI response parser with better validation
function parseAIResponse(content: string): LocationAnalysis {
  if (!content || typeof content !== "string") {
    throw new Error("Invalid AI response content");
  }

  let cleanContent = content.trim();

  // Remove various markdown formatting
  if (cleanContent.startsWith("```json")) {
    cleanContent = cleanContent
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "");
  } else if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  cleanContent = cleanContent.replace(/^`+|`+$/g, "");

  try {
    const parsed = JSON.parse(cleanContent);

    // Comprehensive validation and fallbacks
    const validatedAnalysis: LocationAnalysis = {
      areaClassification: {
        type: ["Urban", "Suburban", "Rural"].includes(
          parsed.areaClassification?.type
        )
          ? parsed.areaClassification.type
          : "Urban",
        description:
          parsed.areaClassification?.description || "Mixed-use urban area",
        characteristics: Array.isArray(
          parsed.areaClassification?.characteristics
        )
          ? parsed.areaClassification.characteristics.slice(0, 5)
          : ["Moderate density", "Mixed development"],
      },
      securityAssessment: {
        score: Math.min(
          Math.max(Number(parsed.securityAssessment?.score) || 75, 0),
          100
        ),
        factors: Array.isArray(parsed.securityAssessment?.factors)
          ? parsed.securityAssessment.factors.slice(0, 5)
          : ["Police presence", "Community watch"],
        recommendations: Array.isArray(
          parsed.securityAssessment?.recommendations
        )
          ? parsed.securityAssessment.recommendations.slice(0, 5)
          : ["Install security systems", "Join neighborhood watch"],
      },
      transportation: {
        score: Math.min(
          Math.max(Number(parsed.transportation?.score) || 70, 0),
          100
        ),
        publicTransport: parsed.transportation?.publicTransport || "Available",
        trafficCondition: ["Light", "Moderate", "Heavy"].includes(
          parsed.transportation?.trafficCondition
        )
          ? parsed.transportation.trafficCondition
          : "Moderate",
        infrastructure: ["Good", "Fair", "Poor"].includes(
          parsed.transportation?.infrastructure
        )
          ? parsed.transportation.infrastructure
          : "Good",
      },
      infrastructure: {
        powerSupply: ["Stable", "Intermittent"].includes(
          parsed.infrastructure?.powerSupply
        )
          ? parsed.infrastructure.powerSupply
          : "Stable",
        water: ["Available", "Limited"].includes(parsed.infrastructure?.water)
          ? parsed.infrastructure.water
          : "Available",
        internet: ["Good", "Fair", "Poor"].includes(
          parsed.infrastructure?.internet
        )
          ? parsed.infrastructure.internet
          : "Good",
        waste: ["Regular", "Irregular"].includes(parsed.infrastructure?.waste)
          ? parsed.infrastructure.waste
          : "Regular collection",
      },
      amenities: {
        education: Array.isArray(parsed.amenities?.education)
          ? parsed.amenities.education.slice(0, 5)
          : ["Schools nearby"],
        healthcare: Array.isArray(parsed.amenities?.healthcare)
          ? parsed.amenities.healthcare.slice(0, 5)
          : ["Clinic available"],
        shopping: Array.isArray(parsed.amenities?.shopping)
          ? parsed.amenities.shopping.slice(0, 5)
          : ["Local markets"],
        entertainment: Array.isArray(parsed.amenities?.entertainment)
          ? parsed.amenities.entertainment.slice(0, 5)
          : ["Recreation center"],
      },
      economicFactors: {
        employmentScore: Math.min(
          Math.max(Number(parsed.economicFactors?.employmentScore) || 70, 0),
          100
        ),
        incomeLevel: ["High", "Middle", "Low"].includes(
          parsed.economicFactors?.incomeLevel
        )
          ? parsed.economicFactors.incomeLevel
          : "Middle",
        commercialActivity: ["High", "Moderate", "Low"].includes(
          parsed.economicFactors?.commercialActivity
        )
          ? parsed.economicFactors.commercialActivity
          : "Moderate",
      },
      futureDevelopment: {
        growthPotential: ["High", "Moderate", "Low"].includes(
          parsed.futureDevelopment?.growthPotential
        )
          ? parsed.futureDevelopment.growthPotential
          : "Moderate",
        plannedProjects: Array.isArray(
          parsed.futureDevelopment?.plannedProjects
        )
          ? parsed.futureDevelopment.plannedProjects.slice(0, 5)
          : ["Road improvements"],
        outlook: ["Positive", "Stable", "Declining"].includes(
          parsed.futureDevelopment?.outlook
        )
          ? parsed.futureDevelopment.outlook
          : "Stable",
      },
      environmental: {
        airQuality: ["Good", "Moderate", "Poor"].includes(
          parsed.environmental?.airQuality
        )
          ? parsed.environmental.airQuality
          : "Moderate",
        noiseLevel: ["Low", "Moderate", "High"].includes(
          parsed.environmental?.noiseLevel
        )
          ? parsed.environmental.noiseLevel
          : "Moderate",
        greenSpaces: ["Abundant", "Moderate", "Limited"].includes(
          parsed.environmental?.greenSpaces
        )
          ? parsed.environmental.greenSpaces
          : "Limited",
        floodRisk: ["Low", "Moderate", "High"].includes(
          parsed.environmental?.floodRisk
        )
          ? parsed.environmental.floodRisk
          : "Low",
      },
      investmentOutlook: {
        appreciationPotential: ["High", "Moderate", "Low"].includes(
          parsed.investmentOutlook?.appreciationPotential
        )
          ? parsed.investmentOutlook.appreciationPotential
          : "Moderate",
        rentalDemand: ["High", "Good", "Low"].includes(
          parsed.investmentOutlook?.rentalDemand
        )
          ? parsed.investmentOutlook.rentalDemand
          : "Good",
        riskLevel: ["Low", "Medium", "High"].includes(
          parsed.investmentOutlook?.riskLevel
        )
          ? parsed.investmentOutlook.riskLevel
          : "Medium",
      },
      overallScore: Math.min(
        Math.max(Number(parsed.overallScore) || 75, 0),
        100
      ),
      summary:
        parsed.summary ||
        "Location analysis based on available data and market indicators.",
    };

    return validatedAnalysis;
  } catch (parseError) {
    systemLogger("Failed to parse AI response:", {
      error: parseError,
      content: cleanContent.substring(0, 200),
    });
    throw new Error("Failed to parse AI analysis response");
  }
}

// Enhanced AI API call with retries and timeout
async function callOpenAI(prompt: string, retries = 0): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CONFIG.AI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert Nigerian real estate analyst and urban planner. Provide comprehensive, accurate location analysis based on Nigerian market conditions. Always respond with valid JSON only, no markdown formatting.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: CONFIG.TEMPERATURE,
        max_tokens: CONFIG.MAX_TOKENS,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (!result.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from OpenAI");
    }

    return result.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);

    const errorMessage = error instanceof Error ? error.message : String(error);

    systemLogger(
      "[AI] Request failed",
      `AI request failed: ${errorMessage} (retries: ${retries})`
    );

    const errorName = error instanceof Error ? error.name : "UnknownError";

    if (errorName === "AbortError") {
      throw new Error("AI request timed out");
    }

    // Retry logic
    if (retries < CONFIG.MAX_RETRIES && !errorMessage.includes("401")) {
      systemLogger(
        "[AI] Request failed, retrying...",
        `AI request failed, retrying... (${retries + 1}/${CONFIG.MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1)));
      return callOpenAI(prompt, retries + 1);
    }

    throw error;
  }
}

// Generate fallback analysis
function generateFallbackAnalysis(location: any): LocationAnalysis {
  const { address, city, state } = location;

  return {
    areaClassification: {
      type: "Urban",
      description: `Mixed-use area in ${city}, ${state}`,
      characteristics: [
        "Moderate density development",
        "Mixed residential and commercial",
        "Established neighborhood",
      ],
    },
    securityAssessment: {
      score: 75,
      factors: [
        "Community presence",
        "Street lighting available",
        "Neighborhood watch potential",
      ],
      recommendations: [
        "Install security systems",
        "Join neighborhood watch",
        "Improve lighting where needed",
      ],
    },
    transportation: {
      score: 70,
      publicTransport: "Available",
      trafficCondition: "Moderate",
      infrastructure: "Good",
    },
    infrastructure: {
      powerSupply: "Stable",
      water: "Available",
      internet: "Good",
      waste: "Regular",
    },
    amenities: {
      education: ["Local schools", "Educational facilities nearby"],
      healthcare: ["Healthcare centers", "Medical facilities"],
      shopping: ["Local markets", "Shopping areas"],
      entertainment: ["Recreation facilities", "Community centers"],
    },
    economicFactors: {
      employmentScore: 70,
      incomeLevel: "Middle",
      commercialActivity: "Moderate",
    },
    futureDevelopment: {
      growthPotential: "Moderate",
      plannedProjects: ["Infrastructure improvements", "Development projects"],
      outlook: "Stable",
    },
    environmental: {
      airQuality: "Moderate",
      noiseLevel: "Moderate",
      greenSpaces: "Limited",
      floodRisk: "Low",
    },
    investmentOutlook: {
      appreciationPotential: "Moderate",
      rentalDemand: "Good",
      riskLevel: "Medium",
    },
    overallScore: 75,
    summary: `Location analysis for ${
      address || city
    }, ${state}. The area offers moderate investment potential with good basic amenities and infrastructure. Analysis based on general market conditions.`,
  };
}

// Create optimized AI prompt
function createAIPrompt(location: any, nearbyProperties: any[]): string {
  const { address, city, state, coordinates } = location;

  const nearbyPropertiesContext =
    nearbyProperties?.length > 0
      ? nearbyProperties
          .slice(0, 10)
          .map(
            (p) =>
              `- ${p.title}: ₦${
                p.price?.amount
                  ? (p.price.amount / 100).toLocaleString()
                  : "N/A"
              } (${p.type} - ${p.category})`
          )
          .join("\n")
      : "Limited nearby property data available";

  return `
Analyze this Nigerian property location comprehensively:

PROPERTY LOCATION:
- Address: ${address || "Not specified"}
- City: ${city}
- State: ${state}
- Coordinates: ${
    coordinates ? `${coordinates.lat}, ${coordinates.lng}` : "Not available"
  }

NEARBY PROPERTIES CONTEXT:
${nearbyPropertiesContext}

ANALYSIS REQUIREMENTS:
1. Consider Nigerian market conditions, infrastructure challenges, and local factors
2. Be realistic about security, power, water, and transportation in Nigerian context
3. Factor in state-specific characteristics for ${state}
4. Consider typical urban planning and development patterns in Nigeria

Provide analysis in this exact JSON format (no markdown, pure JSON only):
{
  "areaClassification": {
    "type": "Urban/Suburban/Rural",
    "description": "Detailed area description",
    "characteristics": ["char1", "char2", "char3"]
  },
  "securityAssessment": {
    "score": 75,
    "factors": ["factor1", "factor2", "factor3"],
    "recommendations": ["rec1", "rec2", "rec3"]
  },
  "transportation": {
    "score": 70,
    "publicTransport": "Available/Limited/None",
    "trafficCondition": "Light/Moderate/Heavy",
    "infrastructure": "Good/Fair/Poor"
  },
  "infrastructure": {
    "powerSupply": "Stable/Intermittent",
    "water": "Available/Limited",
    "internet": "Good/Fair/Poor",
    "waste": "Regular/Irregular"
  },
  "amenities": {
    "education": ["school1", "school2"],
    "healthcare": ["hospital1", "clinic1"],
    "shopping": ["market1", "mall1"],
    "entertainment": ["park1", "cinema1"]
  },
  "economicFactors": {
    "employmentScore": 70,
    "incomeLevel": "High/Middle/Low",
    "commercialActivity": "High/Moderate/Low"
  },
  "futureDevelopment": {
    "growthPotential": "High/Moderate/Low",
    "plannedProjects": ["project1", "project2"],
    "outlook": "Positive/Stable/Declining"
  },
  "environmental": {
    "airQuality": "Good/Moderate/Poor",
    "noiseLevel": "Low/Moderate/High",
    "greenSpaces": "Abundant/Moderate/Limited",
    "floodRisk": "Low/Moderate/High"
  },
  "investmentOutlook": {
    "appreciationPotential": "High/Moderate/Low",
    "rentalDemand": "High/Good/Low",
    "riskLevel": "Low/Medium/High"
  },
  "overallScore": 75,
  "summary": "Comprehensive location assessment summary"
}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    // Validate request body
    let requestBody: any;
    if (!req.body) {
      return createResponse(
        createErrorResponse("Request body is required"),
        400
      );
    }
    try {
      requestBody = await req.json();
    } catch (error: any) {
      systemLogger(
        "[AI-ANALYSIS]",
        `Invalid JSON in request body: ${error.message}`
      );
      return createResponse(
        createErrorResponse("Invalid JSON in request body"),
        400
      );
    }

    const { propertyId } = requestBody;

    if (!propertyId || typeof propertyId !== "string") {
      return createResponse(
        createErrorResponse("Valid property ID is required"),
        400
      );
    }

    const supabase = createTypedSupabaseClient();

    // Get property details with better error handling
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, title, location, type, category, price")
      .eq("id", propertyId)
      .single();

    if (propertyError) {
      systemLogger("[AI-ANALYSIS]", propertyError);
      return createResponse(
        createErrorResponse("Property not found or database error"),
        404
      );
    }

    if (!property) {
      return createResponse(createErrorResponse("Property not found"), 404);
    }

    // Extract and validate location information
    let location: any = property.location;
    if (
      !location ||
      typeof location !== "object" ||
      Array.isArray(location) ||
      location === null
    ) {
      location = {};
    }
    const { address, city, state, coordinates } = location;

    if (!city || !state) {
      return createResponse(
        createErrorResponse("Property location information is incomplete"),
        400
      );
    }

    // Check cache first
    const cacheKey = createCacheKey(propertyId, location);
    const cachedAnalysis = getCachedAnalysis(cacheKey);

    if (cachedAnalysis) {
      systemLogger(
        "[AI-ANALYSIS]",
        `Using cached analysis for property ${propertyId}`
      );
      return createResponse(
        createSuccessResponse({
          ...cachedAnalysis,
          metadata: {
            ...cachedAnalysis.metadata,
            cached: true,
            cacheAge: Date.now() - analysisCache.get(cacheKey)!.timestamp,
          },
        })
      );
    }

    // Get nearby properties for context with optimized query
    const { data: nearbyProperties, error: nearbyError } = await supabase
      .from("properties")
      .select("id, title, price, location, type, category")
      .eq("location->>state", state)
      .eq("location->>city", city)
      .neq("id", propertyId)
      .limit(CONFIG.NEARBY_PROPERTIES_LIMIT);

    if (nearbyError) {
      systemLogger("Failed to fetch nearby properties:", nearbyError);
    }

    let analysis: LocationAnalysis;

    try {
      // Attempt AI analysis
      const aiPrompt = createAIPrompt(location, nearbyProperties || []);
      const aiContent = await callOpenAI(aiPrompt);
      analysis = parseAIResponse(aiContent);

      systemLogger("[AI-ANALYSIS]", `${JSON.stringify(analysis, null, 2)}`);

      systemLogger(`AI analysis completed for property ${propertyId}`);
    } catch (aiError) {
      console.error("AI analysis failed:", aiError);

      // Use fallback analysis
      analysis = generateFallbackAnalysis(location);
      systemLogger(`Using fallback analysis for property ${propertyId}`);
    }

    // Prepare response
    const response = {
      propertyId,
      location: {
        address,
        city,
        state,
        coordinates,
      },
      analysis,
      metadata: {
        aiModel: CONFIG.AI_MODEL,
        analysisTimestamp: new Date().toISOString(),
        nearbyPropertiesAnalyzed: nearbyProperties?.length || 0,
        cached: false,
      },
    };

    // Cache the successful analysis
    cacheAnalysis(cacheKey, response);

    return createResponse(createSuccessResponse(response));
  } catch (error) {
    systemLogger("Unexpected error in location analysis:", error);
    return createResponse(
      createErrorResponse("Internal server error during location analysis"),
      500
    );
  }
});
