'use client';

import { useState, useEffect, useRef } from 'react';
import { FiMic, FiSquare, FiMoon, FiSun, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '@/store/store';
import useAudioRecorder from '@/hooks/useAudioRecorder';

export default function Home() {
  const {
    messages,
    addMessage,
    clearMessages,
    isDarkMode,
    toggleTheme,
    isSettingsOpen,
    toggleSettings,
    llmModel,
    setLlmModel,
    isProcessing,
    setIsProcessing,
    isSpeaking,
    setIsSpeaking,
    speakingMessageId,
    setSpeakingMessageId,
    currentAudio,
    setCurrentAudio
  } = useStore();

  const { isRecording, startRecording, stopRecording, error } = useAudioRecorder();
  
  const [errorMessage, setErrorMessage] = useState('');
  const conversationEndRef = useRef(null);
  const audioRef = useRef(new Audio());

  // Thema anwenden
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';
    
    // Theme im localStorage speichern
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Initialisiere Theme aus localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
  }, []);
  
  // Fehlerbehandlung
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  }, [error]);

  // Nach unten scrollen, wenn neue Nachrichten ankommen
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // LLM-Anfrage senden, wenn eine neue Benutzernachricht hinzugefügt wird
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && lastMessage.role === 'user') {
      handleLlmRequest(lastMessage.content);
    }
  }, [messages]);

  // Audio beenden, wenn eine neue Aufnahme startet
  useEffect(() => {
    if (isRecording && isSpeaking) {
      stopSpeaking();
    }
  }, [isRecording]);

  // Audio-Setup
  useEffect(() => {
    const audio = audioRef.current;
    
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('error', handleAudioError);
    
    return () => {
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('error', handleAudioError);
      audio.pause();
    };
  }, []);

  const handleAudioEnded = () => {
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  };

  const handleAudioError = (e) => {
    console.error('Audio-Fehler:', e);
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    setErrorMessage('Fehler bei der Audiowiedergabe');
  };

  // LLM-Anfrage verarbeiten
  const handleLlmRequest = async (userInput) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.filter(msg => msg.role !== 'system'),
          model: llmModel,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Fehler bei der LLM-Anfrage: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.response) {
        const newMessage = { role: 'assistant', content: data.response, id: Date.now() };
        addMessage(newMessage);
        
        // Starte automatisch die Sprachausgabe
        generateSpeech(newMessage);
      }
    } catch (err) {
      console.error('Fehler bei der LLM-Verarbeitung:', err);
      setErrorMessage(`Fehler: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-zu-Sprache
  const generateSpeech = async (message) => {
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message.content,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Fehler bei der Sprachsynthese');
      }
      
      // Stoppe aktuelles Audio, falls es abgespielt wird
      stopSpeaking();
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = audioRef.current;
      audio.src = audioUrl;
      
      setCurrentAudio(audioUrl);
      setIsSpeaking(true);
      setSpeakingMessageId(message.id);
      
      await audio.play();
    } catch (err) {
      console.error('Fehler bei der Sprachgenerierung:', err);
      setErrorMessage('Fehler bei der Sprachausgabe');
    }
  };

  // Sprechen stoppen
  const stopSpeaking = () => {
    const audio = audioRef.current;
    
    if (!audio.paused) {
      audio.pause();
    }
    
    if (currentAudio) {
      URL.revokeObjectURL(currentAudio);
      setCurrentAudio(null);
    }
    
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  };

  // Aufnahmeknopf-Handler
  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Modell wechseln
  const handleModelChange = (e) => {
    setLlmModel(e.target.value);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <h1 className="text-xl font-semibold">KI Sprachassistent</h1>
        <div className="flex gap-3">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-lg hover:bg-hover-color"
            aria-label="Theme wechseln"
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          <button 
            onClick={toggleSettings} 
            className="p-2 rounded-lg hover:bg-hover-color"
            aria-label="Einstellungen öffnen"
          >
            <FiSettings size={20} />
          </button>
        </div>
      </header>

      {/* Hauptinhalt */}
      <main className="flex-1 flex flex-col py-4">
        {/* Fehlermeldung */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4 text-center"
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Konversation */}
        <div className="conversation-container" id="conversation-container">
          <div className="conversation">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role === 'system' ? 'message-system' : 
                  message.role === 'user' ? 'message-user' : 'message-assistant'} 
                  ${message.id === speakingMessageId ? 'message-speaking relative' : ''}`}
              >
                {message.content}
              </div>
            ))}
            <div ref={conversationEndRef} />
          </div>
        </div>

        {/* Audio-Visualizer */}
        <div className="flex justify-center my-4">
          <div className={`audio-visualizer ${isRecording ? 'audio-visualizer-active' : ''}`}>
            <div className="audio-visualizer-bar"></div>
            <div className="audio-visualizer-bar"></div>
            <div className="audio-visualizer-bar"></div>
            <div className="audio-visualizer-bar"></div>
            <div className="audio-visualizer-bar"></div>
          </div>
        </div>

        {/* Steuerelemente */}
        <div className="controls">
          <button
            onClick={handleRecordClick}
            disabled={isProcessing}
            className={`record-btn ${isRecording ? 'record-btn-recording' : ''} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isRecording ? 'Aufnahme stoppen' : 'Aufnahme starten'}
          >
            {isRecording ? <FiSquare size={24} color="white" /> : <FiMic size={24} color="white" />}
          </button>
        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal modal-open" onClick={() => toggleSettings()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-medium">Einstellungen</h2>
              <button 
                onClick={() => toggleSettings()}
                className="text-2xl font-bold"
                aria-label="Einstellungen schließen"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="setting-group">
                <label className="setting-label block">LLM-Modell</label>
                <select 
                  className="select-input"
                  value={llmModel}
                  onChange={handleModelChange}
                >
                  <option value="llama-3.2-70b-chat">Llama 3.2 70B</option>
                  <option value="llama-3.2-8b-chat">Llama 3.2 8B</option>
                  <option value="llama-3.1-70b-chat">Llama 3.1 70B</option>
                  <option value="llama-3.1-8b-chat">Llama 3.1 8B</option>
                </select>
              </div>
              <div className="setting-group">
                <button 
                  onClick={clearMessages}
                  className="secondary-btn"
                >
                  Konversation löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}