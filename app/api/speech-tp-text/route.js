import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Keine Audiodatei gefunden' },
        { status: 400 }
      );
    }

    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ API-Schlüssel nicht konfiguriert' },
        { status: 500 }
      );
    }

    // Erstelle einen neuen FormData für die Anfrage an Groq
    const groqFormData = new FormData();
    groqFormData.append('file', audioFile);
    groqFormData.append('model', process.env.NEXT_PUBLIC_DEFAULT_WHISPER_MODEL || 'whisper-large-v3-turbo');

    // Sende die Anfrage an Groq
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: groqFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Fehler:', errorText);
      return NextResponse.json(
        { error: `Fehler bei der Transkription: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Starte parallel die LLM-Verarbeitung (wird Client-seitig abgerufen)
    
    return NextResponse.json({ transcript: data.text });
    
  } catch (error) {
    console.error('Fehler bei der Spracherkennung:', error);
    return NextResponse.json(
      { error: `Interner Serverfehler: ${error.message}` },
      { status: 500 }
    );
  }
}