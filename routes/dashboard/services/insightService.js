const axios = require('axios');

// Generate fallback insight when API is unavailable
const generateFallbackInsight = (userPreferences) => {
  return {
    id: `insight-${Date.now()}`,
    text: `As a ${userPreferences.investorType || 'crypto investor'}, staying informed about ${userPreferences.assets?.join(', ') || 'the market'} is key. Consider diversifying your portfolio and keeping an eye on market trends.`,
    generatedAt: new Date().toISOString(),
  };
};

// Get AI insight from OpenRouter API with fallback
const getAIInsight = async (userPreferences) => {
  // Check if API key is provided
  if (!process.env.OPENROUTER_API_KEY) {
    console.log('getAIInsight: No OPENROUTER_API_KEY found, using fallback insight');
    return generateFallbackInsight(userPreferences);
  }

  // Build personalized prompt based on user preferences
  const assetsList = userPreferences.assets?.length > 0 
    ? userPreferences.assets.join(', ')
    : 'cryptocurrencies';
  
  const investorType = userPreferences.investorType || 'crypto investor';
  
  const prompt = `Generate a brief, personalized crypto investment insight (under 100 words) for a ${investorType} interested in ${assetsList}. Make it actionable and relevant to current market trends.`;

  // List of free models to try (in order of preference)
  // Based on OpenRouter documentation: https://openrouter.ai/docs/quickstart
  const freeModels = [
    // 'openai/gpt-4o',
    'kwaipilot/kat-coder-pro:free',
  ];

  // Try each model until one works
  for (const model of freeModels) {
    try {
      console.log(`getAIInsight: Trying model ${model}...`);
      
      // Call OpenRouter API according to documentation: https://openrouter.ai/docs/quickstart
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a knowledgeable crypto investment advisor. Provide brief, actionable insights tailored to individual investor profiles. Keep responses under 100 words and focus on practical advice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': 'MoveoCrypto Dashboard',
          },
          timeout: 15000, // 15 second timeout
        }
      );

      // Extract insight text from response (OpenRouter follows OpenAI format)
      const insightText = response.data?.choices?.[0]?.message?.content?.trim();

      if (!insightText) {
        console.warn(`getAIInsight: Model ${model} returned empty response, trying next model...`);
        continue; // Try next model
      }

      console.log(`getAIInsight: Successfully generated AI insight using model ${model}`);
      
      return {
        id: `insight-${Date.now()}`,
        text: insightText,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      // Log detailed error information
      if (error.response) {
        const errorData = error.response.data;
        const errorMessage = errorData?.error?.message || errorData?.message || 'Unknown error';
        const errorCode = error.response.status;
        
        console.error(`getAIInsight: Model ${model} failed:`, {
          status: errorCode,
          statusText: error.response.statusText,
          error: errorMessage,
          model: model,
        });

        // If it's a 404 (model not found), try next model
        if (errorCode === 404) {
          console.log(`getAIInsight: Model ${model} not found (404), trying next model...`);
          continue;
        }
        
        // If it's authentication error (401), don't try other models
        if (errorCode === 401) {
          console.error('getAIInsight: Authentication failed - check your OPENROUTER_API_KEY');
          break;
        }
        
        // If it's payment required (402), don't try other models
        if (errorCode === 402) {
          console.error('getAIInsight: Payment required - insufficient credits');
          break;
        }
      } else if (error.request) {
        console.error(`getAIInsight: Model ${model} - No response received (network error)`);
        // Continue to next model on network errors
        continue;
      } else {
        console.error(`getAIInsight: Model ${model} - Error:`, error.message);
        continue;
      }
    }
  }

  // If all models failed, return fallback
  console.log('getAIInsight: All models failed, falling back to static insight');
  return generateFallbackInsight(userPreferences);
};

module.exports = {
  getAIInsight,
};

