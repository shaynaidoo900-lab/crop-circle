/**
 * AI Crop Planning Service
 * Source: Google Gemini API
 * Docs: https://ai.google.dev/docs
 */

export interface CropRecommendation {
  crop: string;
  suitability: 'optimal' | 'good' | 'moderate' | 'poor';
  expectedYield: string;
  growthPeriod: string;
  waterRequirement: 'low' | 'moderate' | 'high';
  soilRequirement: string;
  confidence: number;
  reasoning: string;
}

export interface IntercroppingSuggestion {
  primaryCrop: string;
  companionCrop: string;
  spacing: string;
  benefits: string[];
  considerations: string[];
}

export interface CropRotationPlan {
  year1: string[];
  year2: string[];
  year3: string[];
  soilHealthImpact: string;
  pestManagementBenefits: string;
}

export interface FieldAnalysis {
  overallHealth: string;
  recommendations: string[];
  potentialIssues: string[];
  soilCompatibility: CropRecommendation[];
  irrigationAdvice: string;
  fertilizationPlan: string;
}

// Gemini API configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiRequest {
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
  generationConfig?: {
    temperature: number;
    maxOutputTokens: number;
  };
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const request: GeminiRequest = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
}

export async function getCropRecommendations(
  soilPh: number,
  soilNitrogen: number,
  soilPhosphorus: number,
  soilPotassium: number,
  climateZone: string,
  region: string
): Promise<CropRecommendation[]> {
  try {
    const prompt = `Based on the following soil and climate data, recommend the top 5 crops for agricultural success:

Soil Conditions:
- pH: ${soilPh}
- Nitrogen: ${soilNitrogen} ppm
- Phosphorus: ${soilPhosphorus} ppm
- Potassium: ${soilPotassium} ppm

Climate: ${climateZone}
Region: ${region}

Provide recommendations considering optimal growing conditions. Format as JSON array with: crop name, suitability level (optimal/good/moderate/poor), expected yield range, growth period, water requirement, soil requirement, confidence score (0-100), and brief reasoning.`;

    const response = await callGemini(prompt);
    
    // Try to parse as JSON, fallback to structured response
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      // Return mock data if parsing fails
      return getDefaultCropRecommendations(soilPh);
    }
  } catch (error) {
    // Return default recommendations based on soil pH
    return getDefaultCropRecommendations(soilPh);
  }
}

function getDefaultCropRecommendations(ph: number): CropRecommendation[] {
  const recommendations: CropRecommendation[] = [];

  if (ph >= 6.0 && ph <= 7.5) {
    recommendations.push(
      {
        crop: 'Corn',
        suitability: 'optimal',
        expectedYield: '180-220 bushels/acre',
        growthPeriod: '90-120 days',
        waterRequirement: 'moderate',
        soilRequirement: 'Well-drained, loamy soil with pH 6.0-7.0',
        confidence: 92,
        reasoning: 'Soil pH is ideal for corn production with good nutrient availability.',
      },
      {
        crop: 'Wheat',
        suitability: 'optimal',
        expectedYield: '50-70 bushels/acre',
        growthPeriod: '120-150 days',
        waterRequirement: 'moderate',
        soilRequirement: 'Well-drained loam with pH 6.0-7.5',
        confidence: 90,
        reasoning: 'Current soil conditions support healthy wheat growth.',
      },
      {
        crop: 'Soybeans',
        suitability: 'good',
        expectedYield: '45-65 bushels/acre',
        growthPeriod: '80-120 days',
        waterRequirement: 'moderate',
        soilRequirement: 'Well-drained soil with pH 6.0-7.0',
        confidence: 88,
        reasoning: 'Good compatibility with current soil pH levels.',
      },
      {
        crop: 'Barley',
        suitability: 'good',
        expectedYield: '80-120 bushels/acre',
        growthPeriod: '90-110 days',
        waterRequirement: 'low',
        soilRequirement: 'Well-drained soil with pH 6.0-7.0',
        confidence: 85,
        reasoning: 'Barley tolerates slightly variable pH conditions.',
      },
      {
        crop: 'Alfalfa',
        suitability: 'moderate',
        expectedYield: '4-8 tons/acre',
        growthPeriod: 'Perennial (60-75 days per cutting)',
        waterRequirement: 'high',
        soilRequirement: 'Deep, well-drained soil with pH 6.5-7.5',
        confidence: 80,
        reasoning: 'Requires slightly higher pH for optimal growth.',
      }
    );
  } else if (ph < 6.0) {
    recommendations.push(
      {
        crop: 'Potatoes',
        suitability: 'optimal',
        expectedYield: '300-500 cwt/acre',
        growthPeriod: '90-120 days',
        waterRequirement: 'moderate',
        soilRequirement: 'Slightly acidic soil (pH 5.0-6.0), well-drained',
        confidence: 90,
        reasoning: 'Slightly acidic soil is ideal for potato cultivation.',
      },
      {
        crop: 'Rye',
        suitability: 'optimal',
        expectedYield: '40-60 bushels/acre',
        growthPeriod: '90-110 days',
        waterRequirement: 'low',
        soilRequirement: 'Tolerates acidic soils (pH 5.0-7.0)',
        confidence: 92,
        reasoning: 'Rye is highly tolerant of acidic conditions.',
      },
      {
        crop: 'Oats',
        suitability: 'good',
        expectedYield: '70-100 bushels/acre',
        growthPeriod: '80-100 days',
        waterRequirement: 'moderate',
        soilRequirement: 'Slightly acidic soil, good drainage',
        confidence: 85,
        reasoning: 'Oats perform well in slightly acidic conditions.',
      },
      {
        crop: 'Buckwheat',
        suitability: 'good',
        expectedYield: '800-1500 lbs/acre',
        growthPeriod: '60-90 days',
        waterRequirement: 'moderate',
        soilRequirement: 'Tolerates poor, acidic soils',
        confidence: 88,
        reasoning: 'Buckwheat is tolerant of low-pH soils.',
      },
      {
        crop: 'Sweet Potatoes',
        suitability: 'moderate',
        expectedYield: '200-400 cwt/acre',
        growthPeriod: '90-150 days',
        waterRequirement: 'moderate',
        soilRequirement: 'Sandy, well-drained soil with pH 5.0-6.5',
        confidence: 75,
        reasoning: 'Can grow in acidic soils but prefers pH 5.5-6.0.',
      }
    );
  } else {
    recommendations.push(
      {
        crop: 'Cotton',
        suitability: 'optimal',
        expectedYield: '800-1200 lbs/acre',
        growthPeriod: '150-180 days',
        waterRequirement: 'moderate',
        soilRequirement: 'Deep, well-drained soil with pH 7.0-8.0',
        confidence: 90,
        reasoning: 'Alkaline soils are ideal for cotton production.',
      },
      {
        crop: 'Sugar Beets',
        suitability: 'optimal',
        expectedYield: '20-30 tons/acre',
        growthPeriod: '150-200 days',
        waterRequirement: 'high',
        soilRequirement: 'Deep, loamy soil with pH 7.0-8.0',
        confidence: 88,
        reasoning: 'Thrives in slightly alkaline conditions.',
      },
      {
        crop: 'Barley (forage)',
        suitability: 'good',
        expectedYield: '3-5 tons/acre',
        growthPeriod: '70-90 days',
        waterRequirement: 'low',
        soilRequirement: 'Tolerates alkaline soils (pH 6.5-8.0)',
        confidence: 85,
        reasoning: 'Good tolerance for alkaline conditions.',
      },
      {
        crop: 'Sorghum',
        suitability: 'good',
        expectedYield: '60-100 bushels/acre',
        growthPeriod: '90-120 days',
        waterRequirement: 'low',
        soilRequirement: 'Well-drained soil with pH 6.0-8.0',
        confidence: 82,
        reasoning: 'Drought-tolerant and adapts to various pH levels.',
      },
      {
        crop: 'Lettuce',
        suitability: 'moderate',
        expectedYield: '20-40 tons/acre',
        growthPeriod: '45-65 days',
        waterRequirement: 'high',
        soilRequirement: 'Loose, well-drained soil with pH 6.0-7.0',
        confidence: 70,
        reasoning: 'Can grow in alkaline soils but needs careful water management.',
      }
    );
  }

  return recommendations;
}

export async function getIntercroppingSuggestions(
  primaryCrop: string,
  soilPh: number,
  climateZone: string
): Promise<IntercroppingSuggestion[]> {
  try {
    const prompt = `Suggest the best companion crops for ${primaryCrop} considering:
- Soil pH: ${soilPh}
- Climate: ${climateZone}

Provide intercropping combinations that improve soil health, pest management, and yield. Format as JSON array with primary crop, companion crop, spacing recommendations, benefits, and key considerations.`;

    const response = await callGemini(prompt);
    
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return getDefaultIntercroppingSuggestions(primaryCrop);
    }
  } catch (error) {
    return getDefaultIntercroppingSuggestions(primaryCrop);
  }
}

function getDefaultIntercroppingSuggestions(primaryCrop: string): IntercroppingSuggestion[] {
  const suggestions: Record<string, IntercroppingSuggestion[]> = {
    'Corn': [
      {
        primaryCrop: 'Corn',
        companionCrop: 'Beans',
        spacing: '1:1 rows or 2:1 corn:beans',
        benefits: ['Nitrogen fixation by beans benefits corn', 'Vertical support for climbing beans', 'Reduced weed competition'],
        considerations: ['Ensure adequate nitrogen for both crops', 'Monitor for shared pest issues'],
      },
      {
        primaryCrop: 'Corn',
        companionCrop: 'Squash',
        spacing: '1 corn : 2 squash hills',
        benefits: ['Squash shades soil, reducing moisture loss', 'Weed suppression', 'Ground cover protection'],
        considerations: ['Squash needs more space', 'Harvest timing coordination'],
      },
    ],
    'Wheat': [
      {
        primaryCrop: 'Wheat',
        companionCrop: 'Legumes (Clover)',
        spacing: 'Understory planting',
        benefits: ['Nitrogen fixation', 'Soil erosion prevention', 'Weed suppression during off-season'],
        considerations: ['Terminate cover crop before wheat planting', 'Manage allelopathic effects'],
      },
    ],
    'default': [
      {
        primaryCrop: primaryCrop,
        companionCrop: 'Legumes',
        spacing: 'Interplanting',
        benefits: ['Nitrogen fixation', 'Improved soil structure', 'Biodiversity'],
        considerations: ['Match growth rates', 'Consider light competition'],
      },
    ],
  };

  return suggestions[primaryCrop] || suggestions['default'];
}

export async function getCropRotationPlan(
  currentCrop: string,
  soilPh: number,
  years: number = 3
): Promise<CropRotationPlan> {
  try {
    const prompt = `Create a ${years}-year crop rotation plan starting with ${currentCrop}, considering:
- Current soil pH: ${soilPh}
- Rotation goals: soil health improvement, pest management, nutrient efficiency

Provide a detailed plan for each year's cropping sequence, including soil health impact and pest management benefits.`;

    const response = await callGemini(prompt);
    
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return getDefaultRotationPlan(currentCrop);
    }
  } catch (error) {
    return getDefaultRotationPlan(currentCrop);
  }
}

function getDefaultRotationPlan(currentCrop: string): CropRotationPlan {
  // Standard corn-soybean-wheat rotation for moderate pH soils
  if (currentCrop === 'Corn' || currentCrop === 'Soybeans') {
    return {
      year1: ['Corn', 'Beans', 'Wheat/Cover Crop'],
      year2: ['Soybeans', 'Wheat/Cover Crop', 'Corn'],
      year3: ['Wheat/Cover Crop', 'Corn', 'Beans'],
      soilHealthImpact: 'Legume integration provides nitrogen fixation, cover crops improve organic matter and reduce erosion. The rotation breaks pest and disease cycles while improving soil structure through diverse root systems.',
      pestManagementBenefits: 'Rotation disrupts pest habitats specific to each crop. Corn rootworm populations decline without corn for 1-2 years. Soybean cyst nematode populations reduce when non-host crops are planted.',
    };
  }

  return {
    year1: [currentCrop, 'Legume Cover', 'Different Crop Family'],
    year2: ['Different Crop Family', currentCrop, 'Legume Cover'],
    year3: ['Legume Cover', 'Different Crop Family', currentCrop],
    soilHealthImpact: 'Diversified rotation improves soil organic matter, breaks pest cycles, and balances nutrient use across crop families.',
    pestManagementBenefits: 'Each crop family hosts specific pests and pathogens. Rotation with non-host crops reduces soil-borne disease pressure.',
  };
}

export async function analyzeField(
  fieldName: string,
  ndvi: number,
  soilPh: number,
  soilMoisture: number,
  recentWeather: string,
  healthScore: number
): Promise<FieldAnalysis> {
  try {
    const prompt = `Analyze the following field conditions and provide comprehensive agricultural recommendations:

Field: ${fieldName}
- Current NDVI: ${ndvi}
- Health Score: ${healthScore}%
- Soil pH: ${soilPh}
- Soil Moisture: ${soilMoisture}%
- Recent Weather: ${recentWeather}

Provide a comprehensive analysis including:
1. Overall health assessment
2. Specific recommendations for improvement
3. Potential issues to monitor
4. Soil compatibility for various crops
5. Irrigation advice
6. Fertilization plan

Format as JSON with the specified structure.`;

    const response = await callGemini(prompt);
    
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return getDefaultFieldAnalysis(ndvi, healthScore, soilPh, soilMoisture);
    }
  } catch (error) {
    return getDefaultFieldAnalysis(ndvi, healthScore, soilPh, soilMoisture);
  }
}

function getDefaultFieldAnalysis(
  ndvi: number,
  _healthScore: number,
  soilPh: number,
  soilMoisture: number
): FieldAnalysis {
  let overallHealth = 'Good';
  const recommendations: string[] = [];
  const potentialIssues: string[] = [];
  const soilCompatibility: CropRecommendation[] = getDefaultCropRecommendations(soilPh);
  let irrigationAdvice = 'Maintain current irrigation schedule.';
  let fertilizationPlan = 'Apply balanced NPK fertilizer based on soil test results.';

  if (ndvi < 0.3) {
    overallHealth = 'Critical - Immediate attention required';
    recommendations.push('Conduct soil testing for nutrient deficiencies', 'Check for pest or disease damage', 'Evaluate drainage issues');
    potentialIssues.push('Possible nitrogen deficiency', 'Water stress indicators', 'Pest infestation');
    irrigationAdvice = 'Increase irrigation frequency if moisture is below 35%.';
    fertilizationPlan = 'Apply nitrogen-rich fertilizer immediately, consider foliar feeding.';
  } else if (ndvi < 0.5) {
    overallHealth = 'Stressed - Action needed';
    recommendations.push('Monitor moisture levels closely', 'Consider targeted fertilization', 'Check for early pest signs');
    potentialIssues.push('Minor nutrient deficiency', 'Potential moisture stress', 'Early disease presence');
    irrigationAdvice = 'Monitor soil moisture daily, irrigate when below 40%.';
    fertilizationPlan = 'Apply side-dress nitrogen if soil is low.';
  } else if (ndvi < 0.7) {
    overallHealth = 'Moderate - Good condition with room for improvement';
    recommendations.push('Continue regular monitoring', 'Apply preventive treatments', 'Optimize fertilization timing');
    potentialIssues.push('Minor weed pressure possible', 'Occasional pest activity');
    irrigationAdvice = 'Maintain consistent watering schedule.';
    fertilizationPlan = 'Apply balanced fertilizer at recommended rates.';
  } else {
    overallHealth = 'Healthy - Excellent condition';
    recommendations.push('Continue current management practices', 'Regular maintenance scanning', 'Optimize for yield improvement');
    potentialIssues.push('Minor weed pressure', 'Typical seasonal pests');
    irrigationAdvice = 'Irrigate based on evapotranspiration data.';
    fertilizationPlan = 'Apply maintenance fertilizer, consider foliar micronutrients.';
  }

  // Add pH-specific recommendations
  if (soilPh < 5.5) {
    recommendations.push('Consider lime application to raise soil pH');
    fertilizationPlan += ' pH adjustment may improve nutrient availability.';
  } else if (soilPh > 7.5) {
    recommendations.push('Consider sulfur application if pH continues rising');
  }

  if (soilMoisture < 30) {
    recommendations.push('Irrigation system check recommended');
  } else if (soilMoisture > 70) {
    recommendations.push('Improve drainage to prevent waterlogging');
  }

  return {
    overallHealth,
    recommendations,
    potentialIssues,
    soilCompatibility,
    irrigationAdvice,
    fertilizationPlan,
  };
}

// Generate visual field layout description
export async function generateFieldLayout(
  fieldShape: string,
  areaHectares: number,
  soilType: string,
  irrigationAvailable: boolean
): Promise<string> {
  try {
    const prompt = `Create a detailed visual field layout plan for a ${areaHectares} hectare ${fieldShape} field with ${soilType} soil and ${irrigationAvailable ? 'with' : 'without'} irrigation access.

Describe the optimal field organization including:
- Row orientation and spacing
- Planting zones
- Irrigation layout (if applicable)
- Buffer zones
- Access roads
- Storage area placement

Be specific about measurements and practical considerations.`;

    return await callGemini(prompt);
  } catch (error) {
    return generateDefaultFieldLayout(fieldShape, areaHectares, irrigationAvailable);
  }
}

function generateDefaultFieldLayout(
  fieldShape: string,
  areaHectares: number,
  irrigationAvailable: boolean
): string {
  const orientation = fieldShape.includes('long') ? 'North-South' : 'East-West';
  
  let layout = `OPTIMAL FIELD LAYOUT PLAN\n`;
  layout += `========================\n\n`;
  layout += `Field Shape: ${fieldShape}\n`;
  layout += `Area: ${areaHectares} hectares\n`;
  layout += `Row Orientation: ${orientation} (for maximum sun exposure)\n\n`;
  
  layout += `ZONING RECOMMENDATIONS:\n`;
  layout += `----------------------\n`;
  layout += `1. MAIN PRODUCTION ZONE (80% of area)\n`;
  layout += `   - Primary crop rows oriented ${orientation.toLowerCase()}\n`;
  layout += `   - 60cm row spacing for mechanical access\n`;
  layout += `   - 20m headland for turning equipment\n\n`;
  
  layout += `2. BUFFER ZONES (10% of area)\n`;
  layout += `   - 5m perimeter buffer for environmental compliance\n`;
  layout += `   - 3m grass strips between fields if multiple plots\n\n`;
  
  layout += `3. INFRASTRUCTURE ZONE (10% of area)\n`;
  layout += `   - Equipment storage near field entrance\n`;
  layout += `   - Chemical/seed storage with proper containment\n`;
  layout += `   - Access road connectivity\n\n`;
  
  if (irrigationAvailable) {
    layout += `IRIGATION DESIGN:\n`;
    layout += `-----------------\n`;
    layout += `- Main line along field center\n`;
    layout += `- Drip irrigation for row crops\n`;
    layout += `- Sprinkler coverage for flexible cropping\n`;
    layout += `- Consider fertigation compatibility\n`;
  } else {
    layout += `RAINFED MANAGEMENT:\n`;
    layout += `-------------------\n`;
    layout += `- Contour farming recommended\n`;
    layout += `- Water harvesting potential zones\n`;
    layout += `- Drought-tolerant crop selection\n`;
  }

  return layout;
}