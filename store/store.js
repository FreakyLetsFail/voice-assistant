import { create } from 'zustand';

const useStore = create((set) => ({
  // Theme state
  isDarkMode: true,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  // Conversation state
  messages: [
    { role: 'system', content: 'Hallo! Ich bin dein KI-Assistent. Wie kann ich dir helfen?' }
  ],
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  clearMessages: () => set({
    messages: [{ role: 'system', content: 'Hallo! Ich bin dein KI-Assistent. Wie kann ich dir helfen?' }]
  }),
  
  // Recording state
  isRecording: false,
  setIsRecording: (isRecording) => set({ isRecording }),
  
  // Processing state
  isProcessing: false,
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  
  // Speaking state
  isSpeaking: false,
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  
  // Model settings
  llmModel: process.env.NEXT_PUBLIC_DEFAULT_LLM_MODEL || 'llama-3.2-70b-chat',
  setLlmModel: (llmModel) => set({ llmModel }),
  
  // Settings modal
  isSettingsOpen: false,
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  
  // Current audio
  currentAudio: null,
  setCurrentAudio: (currentAudio) => set({ currentAudio }),
  
  // Add speaking message ID
  speakingMessageId: null,
  setSpeakingMessageId: (speakingMessageId) => set({ speakingMessageId }),
}));

export default useStore;