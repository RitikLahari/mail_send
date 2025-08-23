import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Simple in-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map();

export async function POST(request) {
  let message = '';
  let recipientEmail = '';
  
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Rate limiting: max 3 requests per minute per user
    const userId = session.user.email;
    const now = Date.now();
    const userRequests = rateLimitMap.get(userId) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = userRequests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= 3) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before requesting more suggestions.' },
        { status: 429 }
      );
    }
    
    // Add current request
    recentRequests.push(now);
    rateLimitMap.set(userId, recentRequests);

    const requestData = await request.json();
    message = requestData.message || '';
    recipientEmail = requestData.recipientEmail || '';

    if (!message || !recipientEmail) {
      return NextResponse.json(
        { error: 'Message and recipient email are required' },
        { status: 400 }
      );
    }

    // Get Gemini API key from environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Prepare the prompt for Gemini
    const prompt = `You are an AI writing assistant helping to optimize and improve email messages. 

Original message: "${message}"
Recipient: ${recipientEmail}

Please provide 3 different optimized versions of this message that:
1. Are more professional and polished
2. Have better clarity and structure
3. Are appropriate for email communication
4. Maintain the original intent and meaning
5. Are concise but complete

Format your response as a JSON array with exactly 3 suggestions:
["suggestion1", "suggestion2", "suggestion3"]

Keep each suggestion under 200 words and make them ready to use.`;

    // Call Gemini API - using the correct endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Instead of throwing an error, provide fallback suggestions for rate limits
        return NextResponse.json({
          success: true,
          suggestions: [
            "Due to high demand, I'm providing writing tips instead of AI suggestions. Try starting with a clear greeting and stating your main point concisely.",
            "While the AI service is busy, here's a tip: Use bullet points or numbered lists to organize complex information in your message.",
            "Service temporarily limited. Consider this: End your message with a clear call-to-action or next steps for the recipient."
          ],
          originalMessage: message,
          note: "Fallback suggestions provided due to API rate limiting"
        });
      } else if (response.status === 404) {
        // Model not found or API endpoint issue
        return NextResponse.json({
          success: true,
          suggestions: [
            "The AI service is currently experiencing technical difficulties. Here's a writing tip: Use clear, concise language and structure your message logically.",
            "AI service unavailable. Consider this: Break complex ideas into smaller, digestible paragraphs for better readability.",
            "Service temporarily down. Try this: Use active voice and avoid jargon to make your message more accessible and professional."
          ],
          originalMessage: message,
          note: "Fallback suggestions provided due to AI service configuration issues"
        });
      } else if (response.status === 400) {
        throw new Error('Invalid request to AI service. Please check your message content.');
      } else if (response.status === 403) {
        throw new Error('AI service access denied. Please check your API key.');
      } else if (response.status >= 500) {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`AI service error: ${response.status}`);
      }
    }

    const data = await response.json();
    
    // Extract the response text from Gemini
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('Invalid response from Gemini API');
    }

    // Try to parse JSON from the response
    let suggestions;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by lines and clean up
        suggestions = responseText
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim())
          .filter(line => line.length > 0)
          .slice(0, 3);
      }
    } catch (parseError) {
      // If JSON parsing fails, create suggestions from the text
      suggestions = responseText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 3);
    }

    // Ensure we have exactly 3 suggestions
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      suggestions = [
        "I've reviewed your message and here's a more polished version that maintains your original intent while improving clarity and professionalism.",
        "Here's an alternative approach that might better convey your message with improved structure and tone.",
        "Consider this refined version that enhances readability while preserving the core meaning of your communication."
      ];
    }

    // Limit to 3 suggestions and ensure they're strings
    suggestions = suggestions.slice(0, 3).map(s => String(s));

    return NextResponse.json({
      success: true,
      suggestions: suggestions,
      originalMessage: message
    });

  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    
    // Provide fallback suggestions if AI service fails
    if (error.message.includes('Rate limit') || error.message.includes('unavailable')) {
      return NextResponse.json({
        success: true,
        suggestions: [
          "I'm experiencing technical difficulties with the AI service. Here's a suggestion: Try to be more specific and clear in your message while maintaining a professional tone.",
          "Due to service limitations, here's a tip: Structure your message with a clear greeting, main point, and closing to improve readability.",
          "While the AI is unavailable, consider this: Use active voice and concise language to make your message more impactful and easier to understand."
        ],
        originalMessage: message,
        note: "Fallback suggestions provided due to AI service limitations"
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate AI suggestions',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
