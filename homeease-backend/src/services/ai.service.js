/**
 * AI service using Google Gemini API (free tier).
 * Get your key at: https://aistudio.google.com/apikey
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const DEFAULT_CITIES = 'Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, Gujranwala, Hyderabad, Bahawalpur';

/**
 * Call Gemini to suggest service, city, area from a natural language query.
 * @param {string} query - e.g. "I want an AC technician in DHA Lahore"
 * @param {{ id: string, name: string }[]} servicesList - List of { id, name } from DB
 * @param {string[]} cityNames - List of city names we serve
 * @returns {Promise<{ serviceId?, serviceName?, serviceType?, suggestedCity?, suggestedArea?, isUrgent?, suggestedDate?, suggestedTimeSlot? }>}
 */
export async function suggestServiceFromQuery(query, servicesList, cityNames = []) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('AI Service: GOOGLE_GEMINI_API_KEY is missing in .env');
    return { error: 'AI_SERVICE_NOT_CONFIGURED' };
  }

  const serviceNames = servicesList.map((s) => s.name).join(', ');
  const citiesList = cityNames.length ? cityNames.join(', ') : DEFAULT_CITIES;
  const prompt = `You are a helper for a home services marketplace in Pakistan. The customer wrote:

"${query}"

Available service names (pick exactly one): ${serviceNames}
Available cities (pick exactly one if mentioned): ${citiesList}

Extract:
1. serviceName: best matching service from the list (use exact name).
2. serviceType: one of Repair, Installation, Maintenance, Inspection, Emergency (or null).
3. suggestedCity: if they mention a city/area like "Lahore", "DHA Lahore", "in Karachi", use the city from our list (e.g. Lahore, Karachi). One of: ${citiesList} or null.
4. suggestedArea: neighborhood/area if mentioned (e.g. DHA, Gulshan-e-Iqbal, Phase 5) or null.
5. isUrgent: true only if they say urgent, ASAP, emergency, today, immediately.
6. suggestedDate: if they mention a day as YYYY-MM-DD or null.
7. suggestedTimeSlot: if they mention time as "09:00 AM" or "02:00 PM" or null.

Reply with a single JSON object only, no markdown. Exact shape:
{"serviceName":"Exact Name From List","serviceType":"Repair|Installation|Maintenance|Inspection|Emergency|null","suggestedCity":"City From List|null","suggestedArea":"area or null","isUrgent":false,"suggestedDate":null,"suggestedTimeSlot":null}`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Gemini API error (${res.status}):`, errText);
      if (res.status === 429) return { error: 'AI_RATE_LIMITED' };
      if (res.status === 404) return { error: 'AI_MODEL_NOT_FOUND' };
      return { error: 'AI_REQUEST_FAILED' };
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { error: 'AI_NO_RESPONSE' };

    console.log('Gemini raw response text:', text);

    // Clean up markdown markers if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-z]*\n/i, '').replace(/\n```$/m, '');
    }

    const parsed = JSON.parse(cleaned);

    // Resolve serviceId from serviceName (exact or case-insensitive match)
    const matched = servicesList.find(
      (s) =>
        s.name === parsed.serviceName ||
        (parsed.serviceName && s.name.toLowerCase() === parsed.serviceName.toLowerCase())
    );
    if (matched) {
      parsed.serviceId = matched.id;
      parsed.serviceName = matched.name;
    }

    // Normalize suggestedCity to match our list (case-insensitive)
    if (parsed.suggestedCity && cityNames.length) {
      const cityMatch = cityNames.find((c) => c.toLowerCase() === String(parsed.suggestedCity).toLowerCase());
      if (cityMatch) parsed.suggestedCity = cityMatch;
    }

    return parsed;
  } catch (e) {
    console.error('AI suggestService error:', e);
    return { error: 'AI_REQUEST_FAILED' };
  }
}

export default { suggestServiceFromQuery };
