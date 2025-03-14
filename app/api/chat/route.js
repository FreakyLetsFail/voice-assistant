import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { messages, model = 'llama-3.2-70b-chat' } = await request.json();
    
    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ API-Schlüssel nicht konfiguriert' },
        { status: 500 }
      );
    }

    // System-Nachricht, falls nicht vorhanden
    if (!messages.some(msg => msg.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: 'Du bist ein hilfreicher KI-Assistent, der präzise und freundlich auf Deutsch antwortet.'
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Fehler:', errorText);
      return NextResponse.json(
        { error: `Fehler bei der LLM-Verarbeitung: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    return NextResponse.json({ response: assistantResponse });
    
  } catch (error) {
    console.error('Fehler beim Chat:', error);
    return NextResponse.json(
      { error: `Interner Serverfehler: ${error.message}` },
      { status: 500 }
    );
  }
}