
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createTypedSupabaseClient,
  handleSupabaseError,
  createSuccessResponse,
  createErrorResponse,
  createResponse,
  createCorsResponse,
} from "../shared/supabase-client.ts";

interface LocationAnalysisRequest {
  propertyId: string;
}

interface PropertyLocation {
  address?: string;
  city?: string;
  state?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface Property {
  id: string;
  title?: string;
  price?: {
    amount?: number;
  };
  location?: PropertyLocation;
  type?: string;
  category?: string;
}

interface AreaClassification {
  type: string;
  description: string;
  characteristics: string[];
}

interface SecurityAssessment {
  score: number;
  factors: string[];
  recommendations: string[];
}

interface Transportation {
  score: number;
  publicTransport: string;
  trafficCondition: string;
  infrastructure: string;
}

interface Infrastructure {
  powerSupply: string;
  water: string;
  internet: string;
  waste: string;
}

interface Amenities {
  education: string[];
  healthcare: string[];
  shopping: string[];
  entertainment: string[];
}

interface EconomicFactors {
  employmentScore: number;
  incomeLevel: string;
  commercialActivity: string;
}

interface FutureDevelopment {
  growthPotential: string;
  plannedProjects: string[];
  outlook: string;
}

interface Environmental {
  airQuality: string;
  noiseLevel: string;
  greenSpaces: string;
  floodRisk: string;
}

interface InvestmentOutlook {
  appreciationPotential: string;
  rentalDemand: string;
  riskLevel: string;
}

interface LocationAnalysis {
  areaClassification: AreaClassification;
  securityAssessment: SecurityAssessment;
  transportation: Transportation;
  infrastructure: Infrastructure;
  amenities: Amenities;
  economicFactors: EconomicFactors;
  futureDevelopment: FutureDevelopment;
  environmental: Environmental;
  investmentOutlook: InvestmentOutlook;
  overallScore: number;
  summary: string;
}

interface LocationAnalysisResponse {
  propertyId: string;
  location: PropertyLocation;
  analysis: LocationAnalysis;
  metadata: {
    aiModel: string;
    analysisTimestamp: string;
    nearbyPropertiesAnalyzed: number;
  };
}

// Helper function to clean and parse AI response
function parseAIResponse(content: string): LocationAnalysis {
  // Remove markdown code blocks if present
  let cleanContent = content.trim();
  
  // Remove ```json and ``` if present
  if (cleanContent.startsWith('```json')) {
    cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  // Remove any remaining backticks
  cleanContent = cleanContent.replace(/^`+|`+$/g, '');
  
  // Try to parse the cleaned content
  try {
    const parsed = JSON.parse(cleanContent);
    
    // Validate and provide fallbacks for required structure
    return {
      areaClassification: parsed.areaClassification || {
        type: "Urban",
        description: "Mixed-use urban area",
        characteristics: ["Moderate density", "Mixed development"]
      },
      securityAssessment: parsed.securityAssessment || {
        score: 75,
        factors: ["Police presence", "Community watch"],
        recommendations: ["Install security systems", "Join neighborhood watch"]
      },
      transportation: parsed.transportation || {
        score: 70,
        publicTransport: "Available",
        trafficCondition: "Moderate",
        infrastructure: "Good"
      },
      infrastructure: parsed.infrastructure || {
        powerSupply: "Stable",
        water: "Available",
        internet: "Good",
        waste: "Regular collection"
      },
      amenities: parsed.amenities || {
        education: ["Schools nearby"],
        healthcare: ["Clinic available"],
        shopping: ["Local markets"],
        entertainment: ["Recreation center"]
      },
      economicFactors: parsed.economicFactors || {
        employmentScore: 70,
        incomeLevel: "Middle class",
        commercialActivity: "Moderate"
      },
      futureDevelopment: parsed.futureDevelopment || {
        growthPotential: "Moderate",
        plannedProjects: ["Road improvements"],
        outlook: "Stable"
      },
      environmental: parsed.environmental || {
        airQuality: "Moderate",
        noiseLevel: "Moderate",
        greenSpaces: "Limited",
        floodRisk: "Low"
      },
      investmentOutlook: parsed.investmentOutlook || {
        appreciationPotential: "Moderate",
        rentalDemand: "Good",
        riskLevel: "Medium"
      },
      overallScore: Number(parsed.overallScore) || 75,
      summary: parsed.summary || "Location analysis based on available data and market indicators."
    };
  } catch (parseError) {
    console.error('Failed to parse cleaned content:', cleanContent);
    throw parseError;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    const { propertyId }: LocationAnalysisRequest = await req.json();

    if (!propertyId) {
      return createResponse(
        createErrorResponse("Property ID is required"),
        400
      );
    }

    const supabase = createTypedSupabaseClient();

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return createResponse(createErrorResponse("Property not found"), 404);
    }

    // Extract location information
    const location = property.location as PropertyLocation;
    const address = location?.address || "";
    const city = location?.city || "";
    const state = location?.state || "";
    const coordinates = location?.coordinates;

    // Get nearby properties for context
    const { data: nearbyProperties } = await supabase
      .from("properties")
      .select("id, title, price, location, type, category")
      .eq("location->>state", state)
      .eq("location->>city", city)
      .neq("id", propertyId)
      .limit(20);

    // Prepare comprehensive AI prompt for location analysis
    const aiPrompt = `
Analyze this Nigerian property location and provide comprehensive location intelligence:

Property Location:
- Address: ${address}
- City: ${city}
- State: ${state}
- Coordinates: ${coordinates ? `${coordinates.lat}, ${coordinates.lng}` : "Not available"}

Nearby Properties Context:
${nearbyProperties?.slice(0, 10).map((p: any) => `
- ${p.title}: ₦${p.price?.amount ? (p.price.amount / 100).toLocaleString() : 'N/A'} (${p.type} - ${p.category})
`).join("") || "Limited nearby property data"}

Provide a comprehensive location analysis in this exact JSON format:
{
  "areaClassification": {
    "type": "Urban/Suburban/Rural",
    "description": "Area description",
    "characteristics": ["char1", "char2"]
  },
  "securityAssessment": {
    "score": 75,
    "factors": ["factor1", "factor2"],
    "recommendations": ["rec1", "rec2"]
  },
  "transportation": {
    "score": 70,
    "publicTransport": "Available/Limited",
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
  "summary": "Overall location assessment summary"
}
`;

    // Call OpenAI API
    const openAIResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert real estate analyst and urban planner with comprehensive knowledge of Nigerian cities, infrastructure, and property markets. Always respond with valid JSON only, no markdown formatting."
            },
            {
              role: "user",
              content: aiPrompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 3000,
        }),
      }
    );

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const aiResult = await openAIResponse.json();
    const aiContent = aiResult.choices[0].message.content;

    // Parse AI response with better error handling
    let analysis: LocationAnalysis;
    try {
      analysis = parseAIResponse(aiContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("AI content received:", aiContent);
      
      // Fallback analysis if parsing fails
      analysis = {
        areaClassification: {
          type: "Urban",
          description: `Mixed-use area in ${city}, ${state}`,
          characteristics: ["Moderate density", "Mixed development", "Residential area"]
        },
        securityAssessment: {
          score: 75,
          factors: ["Community presence", "Street lighting", "Access control"],
          recommendations: ["Install security systems", "Join neighborhood watch", "Improve lighting"]
        },
        transportation: {
          score: 70,
          publicTransport: "Available",
          trafficCondition: "Moderate",
          infrastructure: "Good"
        },
        infrastructure: {
          powerSupply: "Stable",
          water: "Available",
          internet: "Good",
          waste: "Regular collection"
        },
        amenities: {
          education: ["Local schools", "Educational facilities"],
          healthcare: ["Healthcare centers", "Medical facilities"],
          shopping: ["Local markets", "Shopping areas"],
          entertainment: ["Recreation facilities", "Community centers"]
        },
        economicFactors: {
          employmentScore: 70,
          incomeLevel: "Middle class",
          commercialActivity: "Moderate"
        },
        futureDevelopment: {
          growthPotential: "Moderate",
          plannedProjects: ["Infrastructure improvements", "Development projects"],
          outlook: "Stable"
        },
        environmental: {
          airQuality: "Moderate",
          noiseLevel: "Moderate",
          greenSpaces: "Limited",
          floodRisk: "Low"
        },
        investmentOutlook: {
          appreciationPotential: "Moderate",
          rentalDemand: "Good",
          riskLevel: "Medium"
        },
        overallScore: 75,
        summary: `Location analysis for ${address || city}, ${state}. The area offers moderate investment potential with good basic amenities and infrastructure.`
      };
    }

    const response: LocationAnalysisResponse = {
      propertyId,
      location: {
        address,
        city,
        state,
        coordinates,
      },
      analysis,
      metadata: {
        aiModel: "gpt-4o",
        analysisTimestamp: new Date().toISOString(),
        nearbyPropertiesAnalyzed: nearbyProperties?.length || 0,
      },
    };

    return createResponse(createSuccessResponse(response));
  } catch (error) {
    console.error("Error in location analysis:", error);
    return createResponse(handleSupabaseError(error), 500);
  }
});
