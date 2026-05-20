import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Sparkles, Loader2, RefreshCw, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  analyzeField,
  getCropRecommendations,
  getIntercroppingSuggestions,
  getCropRotationPlan,
  generateFieldLayout,
  type FieldAnalysis,
  type CropRecommendation,
  type IntercroppingSuggestion,
} from '@/services/ai';
import type { SoilData } from '@/types/database';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'crop-list' | 'rotation-plan' | 'field-analysis' | 'layout';
  data?: unknown;
}

interface AIChatWidgetProps {
  fieldId?: string;
  fieldName?: string;
  soilData?: SoilData;
  ndvi?: number;
  healthScore?: number;
  className?: string;
}

const SUGGESTED_PROMPTS = [
  'What is the current health status of my field?',
  'Recommend the best crops for this soil',
  'Create a crop rotation plan',
  'Suggest intercropping options',
  'Generate a field layout plan',
];

export function AIChatWidget({
  fieldId,
  fieldName,
  soilData,
  ndvi = 0.5,
  healthScore = 75,
  className
}: AIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your Crop Circle AI assistant. I can help you analyze your field data, provide insights about crop health, and recommend personalized care strategies.${
        fieldName ? ` I'm currently looking at ${fieldName}.` : ''
      }`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<string>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((content: string, role: 'user' | 'assistant', type: Message['type'] = 'text', data?: unknown) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role,
        content,
        timestamp: new Date(),
        type,
        data,
      },
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);

    try {
      // Process user query and generate response
      const response = await processUserQuery(userMessage);
      
      if (response) {
        addMessage(response.content, 'assistant', response.type, response.data);
      } else {
        addMessage("I'm sorry, I couldn't process that request. Please try asking about your field's health, crop recommendations, or soil analysis.", 'assistant');
      }
    } catch (error) {
      console.error('AI processing error:', error);
      addMessage("I'm experiencing some technical difficulties. Please try again in a moment.", 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const processUserQuery = async (query: string): Promise<{ content: string; type?: Message['type']; data?: unknown } | null> => {
    const lowerQuery = query.toLowerCase();

    // Field health analysis
    if (lowerQuery.includes('health') || lowerQuery.includes('status') || lowerQuery.includes('ndvi')) {
      if (ndvi && soilData) {
        const analysis = await analyzeField(
          fieldName || 'Unknown Field',
          ndvi,
          soilData.ph,
          soilData.moisture,
          'Recent weather conditions',
          healthScore
        );

        const content = `## Field Health Analysis for ${fieldName || 'Your Field'}\n\n**Overall Status:** ${analysis.overallHealth}\n\n**Key Recommendations:**\n${analysis.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n**Potential Issues to Monitor:**\n${analysis.potentialIssues.map((p, i) => `• ${p}`).join('\n')}\n\n**Irrigation Advice:** ${analysis.irrigationAdvice}\n\n\n**Fertilization Plan:** ${analysis.fertilizationPlan}`;

        return { content, type: 'field-analysis', data: analysis };
      }
      return { content: `Based on the current data, your field shows a ${ndvi >= 0.6 ? 'healthy' : ndvi >= 0.3 ? 'moderate' : 'stressed'} vegetation status with an NDVI of ${ndvi.toFixed(3)}. The health score is currently at ${healthScore}%.` };
    }

    // Crop recommendations
    if (lowerQuery.includes('crop') && (lowerQuery.includes('recommend') || lowerQuery.includes('best') || lowerQuery.includes('suit'))) {
      if (soilData) {
        const crops = await getCropRecommendations(
          soilData.ph,
          soilData.nitrogen,
          soilData.phosphorus,
          soilData.potassium,
          'Temperate',
          fieldName || 'Unknown Region'
        );

        const content = `## Crop Recommendations for Your Field\n\nBased on your soil pH of ${soilData.ph} and nutrient levels:\n\n${crops.map((crop, i) => `### ${i + 1}. ${crop.crop}\n**Suitability:** ${crop.suitability}\n**Expected Yield:** ${crop.expectedYield}\n**Growth Period:** ${crop.growthPeriod}\n**Water Requirement:** ${crop.waterRequirement}\n**Confidence:** ${crop.confidence}%\n**Reasoning:** ${crop.reasoning}`).join('\n\n')}`;

        return { content, type: 'crop-list', data: crops };
      }
      return { content: 'Please provide soil data to get accurate crop recommendations.' };
    }

    // Intercropping suggestions
    if (lowerQuery.includes('intercrop') || (lowerQuery.includes('companion') && lowerQuery.includes('crop'))) {
      const primaryCrop = extractCropFromQuery(query) || 'Corn';
      if (soilData) {
        const suggestions = await getIntercroppingSuggestions(primaryCrop, soilData.ph, 'Temperate');
        
        const content = `## Intercropping Suggestions for ${primaryCrop}\n\n${suggestions.map((s, i) => `### Option ${i + 1}: ${s.primaryCrop} + ${s.companionCrop}\n**Spacing:** ${s.spacing}\n**Benefits:**\n${s.benefits.map((b) => `• ${b}`).join('\n')}\n**Considerations:**\n${s.considerations.map((c) => `• ${c}`).join('\n')}`).join('\n\n')}`;

        return { content, type: 'text', data: suggestions };
      }
      return { content: `For ${primaryCrop}, consider intercropping with legumes like clover or vetch to improve soil nitrogen levels.` };
    }

    // Crop rotation plan
    if (lowerQuery.includes('rotation') || lowerQuery.includes('rotate') || lowerQuery.includes('sequence')) {
      const currentCrop = extractCropFromQuery(query) || 'Corn';
      const rotation = await getCropRotationPlan(currentCrop, soilData?.ph || 6.5, 3);

      const content = `## 3-Year Crop Rotation Plan\n\nStarting with: **${currentCrop}**\n\n### Year 1\n${rotation.year1.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n### Year 2\n${rotation.year2.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n### Year 3\n${rotation.year3.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n**Soil Health Impact:** ${rotation.soilHealthImpact}\n\n**Pest Management Benefits:** ${rotation.pestManagementBenefits}`;

      return { content, type: 'rotation-plan', data: rotation };
    }

    // Field layout
    if (lowerQuery.includes('layout') || lowerQuery.includes('design') || lowerQuery.includes('plan')) {
      const layout = await generateFieldLayout(
        'rectangular field',
        100, // hectares
        soilData?.ph ? `pH ${soilData.ph}` : 'moderate',
        true // irrigation available
      );

      return { content: `## Field Layout Plan\n\n${layout}`, type: 'layout' };
    }

    // General field info query
    if (lowerQuery.includes('pest') || lowerQuery.includes('threat')) {
      return { content: 'Based on current NDVI readings, there are no immediate pest threats detected. However, monitor for aphids and fungal infections during humid periods. Consider preventive measures if NDVI drops below 0.5.' };
    }

    if (lowerQuery.includes('irrigat')) {
      return { content: soilData?.moisture && soilData.moisture < 40
        ? 'Your soil moisture is at ' + soilData.moisture + '%, which is below optimal. Consider increasing irrigation frequency.'
        : 'Current soil moisture levels are adequate. Continue monitoring and adjust irrigation based on evapotranspiration data.' };
    }

    if (lowerQuery.includes('nutrient') || lowerQuery.includes('fertiliz')) {
      return { content: soilData
        ? `Based on your soil analysis:\n\n• Nitrogen: ${soilData.nitrogen} ppm ${soilData.nitrogen < 40 ? '(Consider nitrogen supplementation)' : '(Adequate levels)'}\n• Phosphorus: ${soilData.phosphorus} ppm ${soilData.phosphorus < 25 ? '(May need supplementation)' : '(Good levels)'}\n• Potassium: ${soilData.potassium} ppm ${soilData.potassium < 150 ? '(Below optimal)' : '(Optimal range)'}\n\nConsider a balanced NPK fertilizer application based on these readings.`
        : 'Please provide soil data for accurate nutrient analysis.' };
    }

    // Default response
    return { content: `I can help you with:\n\n• **Field Health Analysis** - Get detailed health status and recommendations\n• **Crop Recommendations** - Best crops for your soil conditions\n• **Intercropping Suggestions** - Companion planting strategies\n• **Crop Rotation Plans** - Multi-year rotation planning\n• **Field Layout Design** - Optimal field organization\n• **Irrigation Advice** - Water management recommendations\n• **Nutrient Analysis** - Fertilization guidance\n\nWhat would you like to know about your ${fieldName || 'field'}?` };
  };

  const extractCropFromQuery = (query: string): string | null => {
    const crops = ['corn', 'wheat', 'soybeans', 'soybeans', 'barley', 'cotton', 'rice', 'potatoes', 'alfalfa', 'sorghum', 'oats', 'rye'];
    for (const crop of crops) {
      if (query.toLowerCase().includes(crop)) {
        return crop.charAt(0).toUpperCase() + crop.slice(1);
      }
    }
    return null;
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-base">AI Crop Planning</CardTitle>
            <p className="text-xs text-muted-foreground">Powered by Google Gemini</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-green-600" />
                </div>
              )}
              <div
                className={cn(
                  'rounded-lg px-4 py-2 max-w-[85%] text-sm',
                  message.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-muted'
                )}
              >
                {message.type === 'field-analysis' && message.data ? (
                  <FieldAnalysisView data={message.data as FieldAnalysis} />
                ) : message.type === 'crop-list' && message.data ? (
                  <CropListView crops={message.data as CropRecommendation[]} />
                ) : message.type === 'rotation-plan' && message.data ? (
                  <RotationPlanView data={message.data} />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                <p
                  className={cn(
                    'text-xs mt-1',
                    message.role === 'user' ? 'text-green-100' : 'text-muted-foreground'
                  )}
                >
                  {message.timestamp.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-green-600" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="text-xs bg-muted hover:bg-muted/80 rounded-full px-3 py-1 transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your field..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

// Sub-components for structured AI responses
function FieldAnalysisView({ data }: { data: FieldAnalysis }) {
  return (
    <div className="space-y-2">
      <p className="font-semibold">Overall: {data.overallHealth}</p>
      <div>
        <p className="font-medium text-xs mb-1">Recommendations:</p>
        <ul className="list-disc list-inside text-xs space-y-0.5">
          {data.recommendations.slice(0, 3).map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-medium text-xs mb-1">Potential Issues:</p>
        <ul className="list-disc list-inside text-xs space-y-0.5">
          {data.potentialIssues.slice(0, 2).map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CropListView({ crops }: { crops: CropRecommendation[] }) {
  return (
    <div className="space-y-2">
      {crops.slice(0, 3).map((crop, i) => (
        <div key={i} className="border-l-2 border-green-500 pl-2">
          <p className="font-medium">{crop.crop}</p>
          <p className="text-xs text-muted-foreground">
            {crop.suitability} • {crop.expectedYield}
          </p>
        </div>
      ))}
    </div>
  );
}

function RotationPlanView({ data }: { data: unknown }) {
  const plan = data as { year1: string[]; year2: string[]; year3: string[] };
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="font-medium">Year 1</p>
          {plan.year1.map((c, i) => <p key={i}>{c}</p>)}
        </div>
        <div>
          <p className="font-medium">Year 2</p>
          {plan.year2.map((c, i) => <p key={i}>{c}</p>)}
        </div>
        <div>
          <p className="font-medium">Year 3</p>
          {plan.year3.map((c, i) => <p key={i}>{c}</p>)}
        </div>
      </div>
    </div>
  );
}