import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId } = await req.json();

    if (!propertyId) {
      return new Response(
        JSON.stringify({ error: "Property ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get property details
    const { data: property, error: propertyError } = await supabaseClient
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return new Response(JSON.stringify({ error: "Property not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract location information
    const location = property.location;
    const address = location?.address || "";
    const city = location?.city || "";
    const state = location?.state || "";
    const coordinates = location?.coordinates;

    // Get nearby properties for context
    const { data: nearbyProperties, error: nearbyError } = await supabaseClient
      .from("properties")
      .select("title, price, location, type, category")
      .eq("location->>state", state)
      .eq("location->>city", city)
      .neq("id", propertyId)
      .limit(20);

    if (nearbyError) {
      console.error("Error fetching nearby properties:", nearbyError);
    }

    // Prepare comprehensive AI prompt for location analysis
    const aiPrompt = `
As a comprehensive real estate and urban planning analyst with deep knowledge of Nigerian cities and neighborhoods, provide a detailed location intelligence report for this property location:

Property Location Details:
- Address: ${address}
- City: ${city}
- State: ${state}
- Coordinates: ${
      coordinates ? `${coordinates.lat}, ${coordinates.lng}` : "Not available"
    }

Nearby Properties Context:
${
  nearbyProperties
    ?.slice(0, 10)
    .map(
      (p) => `
- ${p.title}: ₦${p.price?.amount?.toLocaleString()} (${p.type} - ${p.category})
`
    )
    .join("") || "Limited nearby property data"
}

Please provide a comprehensive analysis covering:

1. AREA CLASSIFICATION
   - Urban/Metro/Suburban/Rural designation
   - Neighborhood character and demographics
   - Development density and planning

2. SECURITY ASSESSMENT
   - General safety perception and crime rates
   - Police presence and security infrastructure
   - Community safety measures

3. TRANSPORTATION & TRAFFIC
   - Traffic congestion patterns
   - Public transportation access
   - Road infrastructure quality
   - Parking availability

4. INFRASTRUCTURE & UTILITIES
   - Power supply reliability
   - Water and sanitation
   - Internet connectivity
   - Waste management

5. AMENITIES & SERVICES
   - Educational institutions (schools, universities)
   - Healthcare facilities
   - Shopping centers and markets
   - Entertainment and recreation

6. ECONOMIC FACTORS
   - Employment opportunities
   - Income levels and affordability
   - Commercial activity
   - Cost of living

7. FUTURE DEVELOPMENT
   - Planned infrastructure projects
   - Growth potential and trends
   - Government development plans

8. ENVIRONMENTAL FACTORS
   - Air quality and pollution levels
   - Noise levels
   - Green spaces and parks
   - Flood risk and drainage

9. INVESTMENT OUTLOOK
   - Property appreciation potential
   - Rental demand and yields
   - Market liquidity
   - Risk factors

Respond in JSON format with these fields:
- areaClassification (object): { type, description, characteristics }
- securityAssessment (object): { score, factors, recommendations }
- transportation (object): { score, publicTransport, trafficCondition, infrastructure }
- infrastructure (object): { powerSupply, water, internet, waste }
- amenities (object): { education, healthcare, shopping, entertainment }
- economicFactors (object): { employmentScore, incomeLevel, commercialActivity }
- futureDevelopment (object): { growthPotential, plannedProjects, outlook }
- environmental (object): { airQuality, noiseLevel, greenSpaces, floodRisk }
- investmentOutlook (object): { appreciationPotential, rentalDemand, riskLevel }
- overallScore (number): Overall location score (1-100)
- summary (string): Executive summary of the location analysis
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
              content:
                "You are an expert real estate analyst and urban planner with comprehensive knowledge of Nigerian cities, infrastructure, and property markets. Provide detailed, accurate location intelligence.",
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

    // Parse AI response
    let analysis;
    try {
      analysis = JSON.parse(aiContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback analysis if parsing fails
      analysis = {
        areaClassification: {
          type: "Urban",
          description: "Mixed-use urban area",
          characteristics: ["Moderate density", "Mixed development"],
        },
        securityAssessment: {
          score: 75,
          factors: ["Police presence", "Community watch"],
          recommendations: [
            "Install security systems",
            "Join neighborhood watch",
          ],
        },
        transportation: {
          score: 70,
          publicTransport: "Available",
          trafficCondition: "Moderate",
          infrastructure: "Good",
        },
        overallScore: 75,
        summary:
          "Location analysis generated with limited data processing capability.",
      };
    }

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
        aiModel: "gpt-4o",
        analysisTimestamp: new Date().toISOString(),
        nearbyPropertiesAnalyzed: nearbyProperties?.length || 0,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in location analysis:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate location analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
