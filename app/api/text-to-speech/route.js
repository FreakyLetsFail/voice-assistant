import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Kein Text für die Sprachsynthese angegeben' },
        { status: 400 }
      );
    }

    const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    const ELEVENLABS_VOICE_ID = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Standard: Rachel
    
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API-Schlüssel nicht konfiguriert' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API Fehler:', errorText);
      return NextResponse.json(
        { error: `Fehler bei der Sprachsynthese: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Hole den Audio-Stream und sende ihn zurück
    const audioBuffer = await response.arrayBuffer();
    
    // Erstelle eine Response mit dem Audio-Buffer und den richtigen Headers
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
    
  } catch (error) {
    console.error('Fehler bei der Sprachsynthese:', error);
    return NextResponse.json(
      { error: `Interner Serverfehler: ${error.message}` },
      { status: 500 }
    );
  }
}