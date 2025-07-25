
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  createTypedSupabaseClient,
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse 
} from '../shared/supabase-client.ts';

interface PropertyData {
  id?: string;
  propertyType: string;
  category: string;
  location?: {
    state?: string;
    city?: string;
    address?: string;
  };
}

interface ComparableProperty {
  title?: string;
  price?: {
    amount?: number;
  };
  location?: {
    city?: string;
  };
}

interface MarketData {
  metric_type: string;
  metric_value: number;
  calculation_date: string;
}

interface PropertyValuationRequest {
  propertyData: PropertyData;
}

interface PropertyValuationResponse {
  estimatedValue: number;
  currency: string;
  valuationMethod: string;
  marketAnalysis: string;
  confidenceScore: number;
  comparableCount: number;
  keyFactors: string[];
  marketTrends: string;
  metadata: {
    aiModel: string;
    analysisTimestamp: string;
    dataPoints: {
      comparables: number;
      marketMetrics: number;
    };
  };
}

interface AIAnalysis {
  estimatedValue?: number;
  confidenceScore?: number;
  marketAnalysis?: string;
  keyFactors?: string[];
  marketTrends?: string;
}

// Helper function to clean and parse AI response
function parseAIResponse(content: string): AIAnalysis {
  // Remove markdown code blocks if present
  let cleanContent = content.trim();
  
  // Remove ```json and ``` if present
  if (cleanContent.startsWith('```json')) {
    cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  // Remove any remaining backticks at start/end
  cleanContent = cleanContent.replace(/^`+|`+$/g, '');
  
  // Try to parse the cleaned content
  try {
    const parsed = JSON.parse(cleanContent);
    
    // Validate and sanitize the parsed data
    return {
      estimatedValue: Number(parsed.estimatedValue) || 0,
      confidenceScore: Math.min(Math.max(Number(parsed.confidenceScore) || 0, 0), 100),
      marketAnalysis: parsed.marketAnalysis || 'AI analysis generated',
      keyFactors: Array.isArray(parsed.keyFactors) ? parsed.keyFactors : ['Location', 'Property Type', 'Market Conditions'],
      marketTrends: parsed.marketTrends || 'Market trends analyzed'
    };
  } catch (parseError) {
    console.error('Failed to parse cleaned content:', cleanContent);
    throw parseError;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const { propertyData }: PropertyValuationRequest = await req.json();

    // Initialize Supabase client
    const supabase = createTypedSupabaseClient();

    // Get comparable properties from database
    const { data: comparableProperties, error: comparableError } = await supabase
      .from('properties')
      .select('title, price, location, specification, type, category')
      .eq('type', propertyData.propertyType)
      .eq('category', propertyData.category)
      .neq('id', propertyData.id || '')
      .limit(10);

    if (comparableError) {
      console.error('Error fetching comparable properties:', comparableError);
    }

    // Get market analytics data
    const { data: marketData, error: marketError } = await supabase
      .from('market_analytics')
      .select('*')
      .eq('property_type', propertyData.propertyType)
      .eq('location_id', propertyData.location?.state || '')
      .order('calculation_date', { ascending: false })
      .limit(5);

    if (marketError) {
      console.error('Error fetching market data:', marketError);
    }

    // Calculate base valuation from comparables
    let baseValuation = 10000000; // 10M NGN default
    if (comparableProperties && comparableProperties.length > 0) {
      const validPrices = comparableProperties
        .map(p => p.price?.amount || 0)
        .filter(price => price > 0);
      
      if (validPrices.length > 0) {
        const avgPrice = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
        baseValuation = avgPrice / 100; // Convert from kobo to naira
      }
    }

    // Prepare data for AI analysis
    const aiPrompt = `
As a professional real estate appraiser with expertise in Nigerian property markets, provide a detailed valuation analysis for the following property:

Property Details:
- Type: ${propertyData.propertyType}
- Category: ${propertyData.category}
- Location: ${propertyData.location?.state}, ${propertyData.location?.city}
- Address: ${propertyData.location?.address}
- Base Market Value: ₦${baseValuation.toLocaleString()}

Comparable Properties Data:
${(comparableProperties as ComparableProperty[])?.map(p => `
- ${p.title}: ₦${p.price?.amount ? (p.price.amount / 100).toLocaleString() : 'N/A'} (${p.location?.city})
`).join('') || 'No comparable properties found'}

Market Analytics:
${(marketData as MarketData[])?.map(m => `
- ${m.metric_type}: ${m.metric_value} (${m.calculation_date})
`).join('') || 'No market data available'}

Please provide a realistic property valuation in Nigerian Naira. Base your estimate on the provided base market value of ₦${baseValuation.toLocaleString()} and adjust based on location, property features, and market conditions.

Respond with ONLY valid JSON in this exact format:
{
  "estimatedValue": ${baseValuation},
  "confidenceScore": 75,
  "marketAnalysis": "Detailed analysis here",
  "keyFactors": ["Factor 1", "Factor 2", "Factor 3"],
  "marketTrends": "Market trends analysis"
}
`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert real estate appraiser specializing in Nigerian property markets. Always respond with valid JSON only, no markdown formatting or code blocks.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const aiResult = await openAIResponse.json();
    const aiContent = aiResult.choices[0].message.content;

    // Parse AI response with better error handling
    let aiAnalysis: AIAnalysis;
    try {
      aiAnalysis = parseAIResponse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI content received:', aiContent);
      
      // Fallback to calculated analysis if parsing fails
      aiAnalysis = {
        estimatedValue: baseValuation,
        confidenceScore: 65,
        marketAnalysis: `Based on ${comparableProperties?.length || 0} comparable properties in the area, this property is valued considering local market conditions and property specifications.`,
        keyFactors: ['Location premium', 'Property condition', 'Market trends', 'Comparable sales'],
        marketTrends: `Current market shows ${marketData?.length || 0} data points indicating stable conditions in ${propertyData.location?.state || 'the area'}.`
      };
    }

    // Ensure numeric values are valid and reasonable
    const estimatedValue = Math.max(Number(aiAnalysis.estimatedValue) || baseValuation, 1000000); // Minimum 1M NGN
    const confidenceScore = Math.min(Math.max(Number(aiAnalysis.confidenceScore) || 65, 0), 100);

    const response: PropertyValuationResponse = {
      estimatedValue,
      currency: 'NGN',
      valuationMethod: 'ai_assisted',
      marketAnalysis: aiAnalysis.marketAnalysis || 'AI-powered analysis based on comparable properties and market data.',
      confidenceScore,
      comparableCount: comparableProperties?.length || 0,
      keyFactors: aiAnalysis.keyFactors || ['Location premium', 'Property condition', 'Market trends'],
      marketTrends: aiAnalysis.marketTrends || 'Current market conditions analyzed',
      metadata: {
        aiModel: 'gpt-4o',
        analysisTimestamp: new Date().toISOString(),
        dataPoints: {
          comparables: comparableProperties?.length || 0,
          marketMetrics: marketData?.length || 0
        }
      }
    };

    return createResponse(createSuccessResponse(response));

  } catch (error) {
    console.error('Error in AI valuation:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Failed to generate AI valuation', errorMessage), 500);
  }
});
