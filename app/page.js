'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Square, 
  Moon, 
  Sun, 
  Settings, 
  LogOut,
  Send,
  Volume2,
  VolumeX
} from 'lucide-react';
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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Alert,
  AlertTitle,
  AlertDescription,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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
  const [textInput, setTextInput] = useState('');
  const conversationEndRef = useRef(null);
  const audioRef = useRef(null);

  // Audio initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
    }
  }, []);

  // Apply theme
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);
  
  // Error handling
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  }, [error]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send LLM request when a new user message is added
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && lastMessage.role === 'user') {
      handleLlmRequest(lastMessage.content);
    }
  }, [messages]);

  // Stop speaking when recording starts
  useEffect(() => {
    if (isRecording && isSpeaking) {
      stopSpeaking();
    }
  }, [isRecording, isSpeaking]);

  // Audio setup
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleAudioEnded = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };
    
    const handleAudioError = (e) => {
      console.error('Audio Error:', e);
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setErrorMessage('Error during audio playback');
    };
    
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('error', handleAudioError);
    
    return () => {
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('error', handleAudioError);
      audio.pause();
    };
  }, [setIsSpeaking, setSpeakingMessageId]);

  // Process LLM request
  const handleLlmRequest = async (userInput) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.filter(msg => msg.role !== 'system' || msg === messages[0]),
          model: llmModel
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add assistant message
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        id: Date.now().toString()
      };
      
      addMessage(assistantMessage);
      
      // Auto-play the response if not recording
      if (!isRecording) {
        await speakText(assistantMessage.content, assistantMessage.id);
      }
      
    } catch (err) {
      console.error('Error in LLM request:', err);
      setErrorMessage(`Error: ${err.message}`);
      
      // Add error message
      addMessage({
        role: 'assistant',
        content: 'Entschuldigung, es gab ein Problem bei der Verarbeitung deiner Anfrage. Bitte versuche es erneut.',
        error: true
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle text input
  const handleTextInputSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim() === '' || isProcessing) return;
    
    // Add user message
    addMessage({ role: 'user', content: textInput });
    setTextInput('');
  };

  // Play text as speech
  const speakText = async (text, messageId) => {
    try {
      // Stop current audio if playing
      if (isSpeaking) {
        stopSpeaking();
      }
      
      // Set speaking state
      setIsSpeaking(true);
      setSpeakingMessageId(messageId);
      
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setCurrentAudio(audioUrl);
      }
    } catch (err) {
      console.error('Error in text-to-speech:', err);
      setErrorMessage(`Error: ${err.message}`);
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only respond if no input fields are active
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

  // Message component
  const Message = ({ message, isLast }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const isError = message.error;
    const isSpeakingThisMessage = speakingMessageId === message.id;
    
    return (
      <div
        className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        {!isUser && !isSystem && (
          <Avatar className="mr-3 mt-1">
            <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`relative max-w-[80%] px-4 py-2 rounded-lg ${
              isUser 
                ? 'bg-primary text-primary-foreground' 
                : isSystem 
                  ? 'bg-muted text-muted-foreground text-center w-full max-w-full italic'
                  : isError
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-secondary text-secondary-foreground'
            } ${isSpeakingThisMessage ? 'message-speaking' : ''}`}
          >
            {message.content}
            
            {!isUser && !isSystem && !isError && (
              <div className="flex justify-end mt-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full"
                        onClick={() => 
                          isSpeakingThisMessage 
                            ? stopSpeaking() 
                            : speakText(message.content, message.id)
                        }
                      >
                        {isSpeakingThisMessage ? (
                          <VolumeX className="h-3 w-3" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isSpeakingThisMessage ? 'Wiedergabe stoppen' : 'Vorlesen'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
        
        {isUser && (
          <Avatar className="ml-3 mt-1">
            <AvatarFallback>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.email || 'User'}`} />
          </Avatar>
        )}
      </div>
    );
  };

  // Audio visualizer component
  const AudioVisualizer = () => (
    <div className={`flex items-center justify-center space-x-1 ${isRecording ? 'audio-visualizer-active' : ''}`}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="audio-visualizer-bar h-1 w-1 bg-primary rounded"
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold">KI Sprachassistent</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isDarkMode ? 'Helles Design' : 'Dunkles Design'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSettings}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Einstellungen
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Abmelden
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>
      
      {/* Main conversation area */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <Message 
              key={message.id || index} 
              message={message} 
              isLast={index === messages.length - 1} 
            />
          ))}
          
          {/* Automatic scroll to bottom */}
          <div ref={conversationEndRef} />
          
          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-center items-center mt-2 mb-6">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Input area */}
      <footer className="p-4 border-t">
        <div className="max-w-3xl mx-auto">
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleTextInputSubmit} className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Nachricht eingeben oder Mikrofon drücken..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isProcessing || isRecording}
              className="flex-1"
            />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="submit" 
                    disabled={textInput.trim() === '' || isProcessing}
                    variant="outline"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Nachricht senden
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    size="icon"
                    className={isRecording ? "animate-pulse-recording" : ""}
                    disabled={isProcessing}
                  >
                    {isRecording ? (
                      <Square className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isRecording ? 'Aufnahme beenden (Leertaste)' : 'Aufnahme starten (Leertaste)'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </form>
          
          {isRecording && (
            <div className="flex justify-center mt-2">
              <AudioVisualizer />
            </div>
          )}
        </div>
      </footer>
      
      {/* Settings dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={toggleSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Einstellungen</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="llm-model" className="text-right col-span-1">
                KI-Modell
              </label>
              <Select
                value={llmModel}
                onValueChange={setLlmModel}
                id="llm-model"
                className="col-span-3"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modell auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llama-3.2-70b-chat">Llama 3.2 70B</SelectItem>
                  <SelectItem value="llama-3.1-8b-chat">Llama 3.1 8B</SelectItem>
                  <SelectItem value="llama-3-70b-chat">Llama 3 70B</SelectItem>
                  <SelectItem value="mixtral-8x7b-instruct">Mixtral 8x7B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right col-span-1">
                Design
              </label>
              <div className="col-span-3">
                <Button
                  variant="outline"
                  onClick={toggleTheme}
                  className="w-full"
                >
                  {isDarkMode ? (
                    <span className="flex items-center">
                      <Sun className="mr-2 h-4 w-4" /> Helles Design
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Moon className="mr-2 h-4 w-4" /> Dunkles Design
                    </span>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right col-span-1">
                Verlauf
              </label>
              <div className="col-span-3">
                <Button
                  variant="outline"
                  onClick={clearMessages}
                  className="w-full text-destructive"
                >
                  Konversation zurücksetzen
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={toggleSettings}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}