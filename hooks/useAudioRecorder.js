import { useState, useEffect, useCallback, useRef } from 'react';
import useStore from '@/store/store';

const useAudioRecorder = () => {
  const { isRecording, setIsRecording, addMessage, setIsProcessing } = useStore();
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Starten der Aufnahme
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Automatisch die Audiodatei verarbeiten
        await processAudio(audioBlob);
        
        // Schließe den Stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Starten der Aufnahme:', err);
      setError('Mikrofon nicht verfügbar. Bitte erteilen Sie die erforderlichen Berechtigungen.');
      setIsRecording(false);
    }
  }, [setIsRecording]);

  // Stoppen der Aufnahme
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording, setIsRecording]);

  // Verarbeiten der Audiodatei
  const processAudio = async (blob) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('audio', blob);

      const response = await fetch('/api/speech-to-text', { // Fix: Corrected endpoint
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Fehler beim Transkribieren: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.transcript) {
        // Füge die transkribierte Nachricht hinzu
        addMessage({ role: 'user', content: data.transcript });
      } else {
        throw new Error('Keine Transkription erhalten');
      }
    } catch (err) {
      console.error('Fehler bei der Audioverarbeitung:', err);
      setError(`Fehler bei der Verarbeitung: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Aufräumen bei Komponenten-Unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  // Tastatursteuerung für Aufnahme-Start/Stopp mit Leertaste
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Nur reagieren, wenn keine Eingabefelder aktiv sind
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    error
  };
};

export default useAudioRecorder;