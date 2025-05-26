// MindBotZustand.ts
"use client";
import { create } from "zustand";
import { Message } from "../types/types";
import { User } from "next-auth";
import { ChatDetails } from "../types/types";

interface ChatMessage {
    chatID: string;
    userID: string;
    imgName?: string;
    userPrompt: string | null;
    llmResponse: string | null;
}

interface MindBotState {
    // Loading state for messages
    msgLoader: boolean;
    setMsgLoader: (msgLoader: boolean) => void;

    // Previous chat message for context
    setPrevChat: (newChat: Message) => void;
    prevChat: Message;

    // Loading state for top loading bar
    topLoader: boolean;
    setTopLoader: (topLoader: boolean) => void;

    // Current chat message object
    currChat: Message;
    setCurrChat: (name: string | null, value: string | null) => void; // Original setter
    setCurrChatNew: (updater: (prevState: Message) => Message) => void; // Functional setter

    // User data object
    userData: User;
    setUserData: (userData: User) => void;

    // Optimistic response state
    optimisticResponse: string | null;
    setOptimisticResponse: (optimisticResponse: string | null) => void;

    // Toast state
    setToast: (toast: string | null) => void;
    devToast: string | null;

    // Input image state
    inputImgName: string | null;
    setInputImgName: (inputImgName: string | null) => void;

    // Optimistic prompt state
    optimisticPrompt: string | null;
    setOptimisticPrompt: (optimisticPrompt: string | null) => void;

    // Custom prompt state
    customPrompt: { prompt: string | null; placeholder: string | null };
    setCustomPrompt: (value: {
        prompt: string | null;
        placeholder: string | null;
    }) => void;

    // Input media state for image gen
    inputMedia: string | null;
    setInputMedia: (inputMedia: string | null) => void;

    // Media type state for image gen
    mediaType: string | null;
    setMediaType: (mediaType: string | null) => void;

    // Generated images state
    generatedImages: string[];
    setGeneratedImages: (generatedImages: string[]) => void;

    // Chat History State
    chatHistory: ChatMessage[];
    setChatHistory: (chatHistory: ChatMessage[]) => void;

    // MindSearch Active State (Keep for now, might be removable later if only sidebar state is needed)
    mindsearchActive: boolean;
    setMindsearchActive: (mindsearchActive: boolean) => void;

    // Sourcebar (Sidebar) Visibility State
    isSourcebarOpen: boolean;
    activeSearchMode: 'mindsearch' | 'deepsearch' | null; // Track which mode opened the sidebar
    setActiveSearchMode: (mode: 'mindsearch' | 'deepsearch' | null) => void;
    toggleSourcebar: (mode?: 'mindsearch' | 'deepsearch' | null) => void; // Accept optional mode

    isMindPaintOpen: boolean;
    toggleMindPaint: () => void;

    isMindStyleOpen: boolean; // New state for MindStyle sidebar
    toggleMindStyle: () => void; // New action for MindStyle sidebar

    isMindCanvasOpen: boolean; // New state for MindCanvas sidebar
    toggleMindCanvas: () => void; // New action for MindCanvas sidebar

    chats: ChatDetails[];
    setChats: (chats: ChatDetails[]) => void;

    currentLlmResponse: string;
    setCurrentLlmResponse: (response: string) => void;

    promptText: string;
    setPromptText: (text: string) => void;

    // Add state for Mind Canvas input
    canvasInputText: string;
    setCanvasInputText: (text: string) => void;
}

const MindBotZustand = create<MindBotState>()((set) => ({
    msgLoader: false,
    devToast: null,
    prevChat: { userPrompt: "", llmResponse: "" },
    topLoader: false,
    setToast: (value: string | null) => set({ devToast: value }),
    userData: {} as User,
    optimisticResponse: null,
    optimisticPrompt: null,
    inputImgName: null,
    inputMedia: null,
    mediaType: null,
    generatedImages: [],
    chatHistory: [],
    customPrompt: { prompt: null, placeholder: null },
    mindsearchActive: false,
    isSourcebarOpen: false, // Initialize sourcebar state
    activeSearchMode: null, // Initialize active search mode,
    isMindPaintOpen: false,
    isMindStyleOpen: false, // Default state
    isMindCanvasOpen: false, // Default state for MindCanvas
    currentLlmResponse: '',
    promptText: '',

    // Initialize Mind Canvas input state
    canvasInputText: '',

    // Setters
    setCustomPrompt: (value: {
        prompt: string | null;
        placeholder: string | null;
    }) => set({ customPrompt: value }),
    setOptimisticPrompt: (value: string | null) => set({ optimisticPrompt: value }),
    setInputImgName: (value: string | null) => set({ inputImgName: value }),
    setInputMedia: (value: string | null) => set({ inputMedia: value }),
    setMediaType: (value: string | null) => set({ mediaType: value }),
    setGeneratedImages: (value: string[]) => set({ generatedImages: value }),
    setChatHistory: (value: ChatMessage[]) => set({ chatHistory: value }),
    setMindsearchActive: (value: boolean) => set({ mindsearchActive: value }),

    currChat: { userPrompt: "", llmResponse: "" },
    setTopLoader: (topLoader) => set({ topLoader }),
    setMsgLoader: (msgLoader) => set({ msgLoader }),
    setOptimisticResponse: (optimisticResponse: string | null) => set({ optimisticResponse }),
    setPrevChat: (newChat: Message) => set({ prevChat: newChat }),

    setCurrChat: (name: string | null, value: string | null) =>
        set((state) => ({
            currChat: { ...state.currChat, [name as string]: value },
        })),
    setCurrChatNew: (updater: (prevState: Message) => Message) =>
        set((state) => ({
            currChat: updater(state.currChat),
        })),
    setUserData: (userData: User) => set({ userData }),

    // Toggle sourcebar visibility and set active mode
    setActiveSearchMode: (mode: 'mindsearch' | 'deepsearch' | null) => set({ activeSearchMode: mode }),
    toggleSourcebar: (mode?: 'mindsearch' | 'deepsearch' | null) => set((state) => {
        let newActiveMode: 'mindsearch' | 'deepsearch' | null = null;
        let newIsOpen = state.isSourcebarOpen;

        if (mode === null) {
            newIsOpen = false;
        } else {
            newIsOpen = !state.isSourcebarOpen;
            if (newIsOpen && mode && (mode === 'mindsearch' || mode === 'deepsearch')) {
                newActiveMode = mode;
            }
        }

        return { ...state, isSourcebarOpen: newIsOpen, activeSearchMode: newActiveMode };
    }),

    toggleMindPaint: () => set((state) => ({
        isMindPaintOpen: !state.isMindPaintOpen,
        // Close MindStyle if MindPaint is opened
        isMindStyleOpen: state.isMindPaintOpen ? state.isMindStyleOpen : false,
    })),

    toggleMindStyle: () => set((state) => ({
        isMindStyleOpen: !state.isMindStyleOpen,
        // Close MindPaint if MindStyle is opened
        isMindPaintOpen: state.isMindStyleOpen ? state.isMindPaintOpen : false,
    })),

    toggleMindCanvas: () => set((state) => ({
        isMindCanvasOpen: !state.isMindCanvasOpen,
        // Optionally close other sidebars when MindCanvas opens
        isSourcebarOpen: false,
        isMindPaintOpen: false,
        isMindStyleOpen: false,
    })),

    setCurrentLlmResponse: (response) => set({ currentLlmResponse: response }),
    setPromptText: (text) => set({ promptText: text }),

    // Add setter for Mind Canvas input
    setCanvasInputText: (text) => set({ canvasInputText: text }),

    chats: [],
    setChats: (chats) => set({ chats }),
}));

export default MindBotZustand;
