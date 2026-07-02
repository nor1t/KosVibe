/**
 * Groq API client for KosVibe AI Assistant.
 *
 * Uses the Groq Cloud API with the llama-3.3-70b-versatile model
 * for fast, contextual responses about Kosovo travel & discovery.
 */

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

type GroqMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const KOSOVO_SYSTEM_PROMPT = `You are the KosVibe AI guide, a friendly and knowledgeable assistant helping users discover Kosovo.

Your role: Help users find the best restaurants, monuments, nature spots, cultural experiences, events, rural markets, and hidden gems across Kosovo.

Key context about Kosovo you should reference when relevant:
- Major cities: Prishtina (capital), Prizren, Peja, Gjakova, Gjilan, Ferizaj, Mitrovica
- Famous landmarks: Prizren Fortress, Stone Bridge in Prizren, Rugova Canyon, Drini i Bardhe waterfall, Gadime Cave, Mirusha Waterfalls
- Cultural sites: Sultan Mehmet Fatih Mosque, Sinan Pasha Mosque, League of Prizren, Ethnological Museum, Jashar Pasha Mosque
- Traditional food: Flija, pite, qebapa, tavë kosi, stuffed peppers, baklava
- Popular experiences: hiking in Rugova, exploring Prizren's old town, visiting village markets, coffee culture
- The app has sections for: Restaurants, Monuments & Nature, Events, Rural Market, Explore Map, Stories

Rules for your responses:
- Be warm, enthusiastic, and helpful — like a local friend showing someone around
- Keep responses concise (2-4 sentences when possible)
- When recommending a restaurant, mention its cuisine and why it's special
- If asked about something you don't have data on, be honest and suggest exploring a related app section
- Use the user's selected location city name when relevant (provided in context)
- Format your answers as plain text — no markdown, no bullet points
- Do NOT make up specific restaurant names unless they were provided in the context below`;

type ChatContext = {
  selectedLocation: string;
  availableRestaurants: string[];
  availableHighlights: string[];
};

function buildSystemPrompt(context: ChatContext): string {
  return `${KOSOVO_SYSTEM_PROMPT}

Current context:
- User is exploring: ${context.selectedLocation}
- Available restaurants in view: ${context.availableRestaurants.slice(0, 10).join(', ') || 'None loaded yet'}
- Kosovo highlights available: ${context.availableHighlights.join(', ') || 'None loaded yet'}

Use the available restaurant names and highlights when making specific recommendations. If a user asks about a restaurant that isn't in the list, acknowledge you're not sure and suggest exploring the app's Restaurants or Explore sections.`;
}

export async function sendGroqMessage(
  userMessage: string,
  conversationHistory: GroqMessage[],
  context: ChatContext
): Promise<string> {
  if (!GROQ_API_KEY) {
    // Fallback to local rule-based responses if API key is missing
    return generateFallbackReply(userMessage, context);
  }

  try {
    const messages: GroqMessage[] = [
      { role: 'system', content: buildSystemPrompt(context) },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: userMessage },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 300,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return generateFallbackReply(userMessage, context);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return generateFallbackReply(userMessage, context);
    }

    return reply;
  } catch (error) {
    console.error('Groq API request failed:', error);
    return generateFallbackReply(userMessage, context);
  }
}

/**
 * Local fallback when Groq API is unavailable.
 * Uses keyword matching to provide basic helpful responses.
 */
function generateFallbackReply(message: string, context: ChatContext): string {
  const normalized = message.trim().toLowerCase();

  if (normalized.includes('restaurant') || normalized.includes('food') || normalized.includes('eat')) {
    const names = context.availableRestaurants.slice(0, 3).join(', ');
    return names
      ? `Some popular restaurants to check out: ${names}. Tap any restaurant card to see the menu, reviews, and book a table.`
      : `Explore the Restaurants section to find the best spots in ${context.selectedLocation}. You can filter by cuisine and book a table directly in the app.`;
  }

  if (normalized.includes('traditional') || normalized.includes('kosovo food')) {
    return `For traditional Kosovo food, try local favorites like flija, tavë kosi, and stuffed peppers. The Restaurants section has great spots serving authentic cuisine.`;
  }

  if (normalized.includes('monument') || normalized.includes('nature') || normalized.includes('culture')) {
    return `Check out the Monuments & Nature section for Prizren Fortress, Rugova Canyon, Drini i Bardhe waterfall, and more cultural landmarks across Kosovo.`;
  }

  if (normalized.includes('market') || normalized.includes('craft') || normalized.includes('rural')) {
    return `The Rural Market section showcases family sellers with traditional food, handmade crafts, clothing, and instruments rooted in Kosovo's culture.`;
  }

  if (normalized.includes('event') || normalized.includes('night') || normalized.includes('party')) {
    return `Head to the Events section to find community-hosted dinners, culture nights, and meetups happening around ${context.selectedLocation}.`;
  }

  if (normalized.includes('history') || normalized.includes('past')) {
    return `The History of Kosova page gives a concise overview of heritage, identity, and key historical moments. Perfect for context before exploring.`;
  }

  if (normalized.includes('pizza') || normalized.includes('italian')) {
    return `Pizza Napoli is a solid casual pick if you're in the mood for something familiar and easy to share.`;
  }

  if (normalized.includes('coffee') || normalized.includes('cafe')) {
    return `Kosovo has a rich coffee culture. Check the Coffee section in the Explore tab to find cozy cafes for meetings, catchups, and slow mornings.`;
  }

  if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('hey')) {
    return `Hi there! I can help you discover the best of ${context.selectedLocation}. Ask me about restaurants, monuments, nature spots, events, or local markets.`;
  }

  return `I can help you discover Kosovo through food, monuments, nature, markets, events, and culture. Try asking about traditional food, the best monuments, local markets, or what to do in ${context.selectedLocation}.`;
}