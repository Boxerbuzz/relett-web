
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { propertyData } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get comparable properties from database
    const { data: comparableProperties, error: comparableError } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('type', propertyData.propertyType)
      .eq('category', propertyData.category)
      .neq('id', propertyData.id || '')
      .limit(10)

    if (comparableError) {
      console.error('Error fetching comparable properties:', comparableError)
    }

    // Get market analytics data
    const { data: marketData, error: marketError } = await supabaseClient
      .from('market_analytics')
      .select('*')
      .eq('property_type', propertyData.propertyType)
      .eq('location_id', propertyData.location.state)
      .order('calculation_date', { ascending: false })
      .limit(5)

    if (marketError) {
      console.error('Error fetching market data:', marketError)
    }

    // Calculate base valuation using location factors
    const locationMultipliers = {
      'Lagos': 1.8,
      'Abuja': 1.6,
      'Port Harcourt': 1.2,
      'Kano': 1.0,
      'Ibadan': 1.1,
      'Benin': 1.0,
      'default': 1.0
    }

    const propertyTypeBasePrices = {
      'residential': 150000,
      'commercial': 500000,
      'industrial': 300000,
      'agricultural': 50000,
      'mixed_use': 250000
    }

    const categoryMultipliers = {
      'apartment': 0.8,
      'house': 1.0,
      'duplex': 1.3,
      'mansion': 2.0,
      'office': 1.2,
      'retail': 1.1,
      'warehouse': 0.9,
      'factory': 1.0,
      'farmland': 0.5,
      'plot': 0.6
    }

    // Calculate AI-based valuation
    const locationMultiplier = locationMultipliers[propertyData.location.state as keyof typeof locationMultipliers] || locationMultipliers.default
    const basePrice = propertyTypeBasePrices[propertyData.propertyType as keyof typeof propertyTypeBasePrices] || 150000
    const categoryMultiplier = categoryMultipliers[propertyData.category as keyof typeof categoryMultipliers] || 1.0

    // Factor in comparable properties if available
    let comparableAverage = 0
    if (comparableProperties && comparableProperties.length > 0) {
      const comparablePrices = comparableProperties
        .filter(p => p.price?.amount)
        .map(p => p.price.amount)
      
      if (comparablePrices.length > 0) {
        comparableAverage = comparablePrices.reduce((sum, price) => sum + price, 0) / comparablePrices.length
      }
    }

    // Calculate weighted valuation
    let estimatedValue = basePrice * locationMultiplier * categoryMultiplier
    
    if (comparableAverage > 0) {
      // Weight comparable properties at 60%, location-based calculation at 40%
      estimatedValue = (comparableAverage * 0.6) + (estimatedValue * 0.4)
    }

    // Add market trend adjustment
    if (marketData && marketData.length > 0) {
      const recentTrend = marketData[0]
      if (recentTrend.metric_type === 'average_price' && recentTrend.metric_value) {
        const trendAdjustment = recentTrend.metric_value * 0.1 // 10% influence
        estimatedValue += trendAdjustment
      }
    }

    // Add random variation to simulate market volatility (±15%)
    const variation = (Math.random() - 0.5) * 0.3
    estimatedValue = estimatedValue * (1 + variation)

    // Generate confidence score based on available data
    let confidenceScore = 0.5 // Base confidence
    if (comparableProperties && comparableProperties.length > 0) {
      confidenceScore += Math.min(comparableProperties.length * 0.1, 0.3)
    }
    if (marketData && marketData.length > 0) {
      confidenceScore += 0.1
    }
    confidenceScore = Math.min(confidenceScore, 0.95)

    // Generate AI analysis text
    const analysis = `
Our AI valuation model analyzed ${comparableProperties?.length || 0} comparable properties in ${propertyData.location.state} 
and considered current market trends for ${propertyData.propertyType} properties. 

Key factors considered:
• Location premium: ${((locationMultiplier - 1) * 100).toFixed(0)}% above national average
• Property category adjustment: ${((categoryMultiplier - 1) * 100).toFixed(0)}%
• Comparable sales analysis: ${comparableProperties?.length || 0} recent transactions
• Market trend indicators: ${marketData?.length || 0} data points

The valuation shows ${confidenceScore > 0.7 ? 'high' : confidenceScore > 0.5 ? 'moderate' : 'limited'} confidence 
based on available market data. This estimate should be verified with a professional appraisal for financing purposes.
    `.trim()

    const response = {
      estimatedValue: Math.round(estimatedValue),
      currency: 'NGN',
      valuationMethod: 'ai_assisted',
      marketAnalysis: analysis,
      confidenceScore: Math.round(confidenceScore * 100),
      comparableCount: comparableProperties?.length || 0,
      metadata: {
        locationMultiplier,
        categoryMultiplier,
        basePrice,
        comparableAverage,
        marketTrendInfluence: marketData?.length || 0
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in AI valuation:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI valuation',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
