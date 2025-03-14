'use client';

import { useState, useEffect, useRef } from 'react';
import { FiMic, FiSquare, FiMoon, FiSun, FiSettings, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '@/store/store';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { useAuth } from './auth/SupabaseAuthProvider';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
  SelectItem,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui';

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
  const { user, signOut } = useAuth();
  
  const [errorMessage, setErrorMessage] = useState('');
  const conversationEndRef = useRef(null);
  const audioRef = useRef(null);

  // Audio-Referenz initialisieren
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
    }
  }, []);

  // Thema anwenden
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);
  
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
  }, [isRecording, isSpeaking]);

  // Audio-Setup
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
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
    
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('error', handleAudioError);
    
    return () => {
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('error', handleAudioError);
      audio.pause();
    };
  }, [setIsSpeaking, setSpeakingMessageId]);

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