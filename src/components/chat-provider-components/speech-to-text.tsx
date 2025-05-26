// speech-to-text.tsx

import React, { useState, useEffect, useRef } from "react";
import DevButton from "../dev-components/dev-button";
import ReactTooltip from "../dev-components/react-tooltip";
import  MindBotZustand from "@/utils/mindbot-zustand";

// Declare the necessary types
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    isFinal: boolean; // **Crucially added isFinal property**
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string; // Add lang property
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onstart: () => void; // Add onstart
    onend: () => void;   // Add onend
    start(): void;
    stop(): void;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
}

interface SpeechToTextProps {
    setCurrChat: (key: string, value: any) => void;
    isMindSpeechActive: boolean; // Receive active prop
    onClose?: () => void;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({
    setCurrChat,
    isMindSpeechActive,
}) => {
    const [isListening, setIsListening] = useState<boolean>(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(
        null
    );
    const [isMicAvailable, setIsMicAvailable] = useState<boolean>(false);
    const { setToast } = MindBotZustand();
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [tempTranscript, setTempTranscript] = useState("");
    const { currChat } = MindBotZustand();
    const [detectedLanguage, setDetectedLanguage] = useState<string>(""); //Store the detected Language

    useEffect(() => {
        // Function to get the browser's language
        const getBrowserLanguage = (): string => {
            return navigator.language || navigator.languages[0] || "en-US"; // Default to English if not found
        };

        // Set the initial language
        const browserLanguage = getBrowserLanguage();
        setDetectedLanguage(browserLanguage);

        //This check is in case the browser language is not available to the speech recognizer and crashes it
        if (!('webkitSpeechRecognition' in window)) {
            setToast('Speech recognition is not supported in this browser');
            return
        }

        const recognitionInstance = new (window as any).webkitSpeechRecognition() as SpeechRecognition;
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = browserLanguage; // Use detected language

        recognitionInstance.onstart = () => {
            console.log("Speech recognition started");
        };

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
            let currentInterimTranscript = "";
            let finalTranscript = "";

            if (event.results) {
                for (let i = 0; i < event.results.length; ++i) {
                    const result = event.results[i];

                    if (result && result.length > 0) {
                        const alternative = result.item(0);

                        if (alternative) {
                            if (event.results[i].isFinal) {
                                finalTranscript += alternative.transcript;
                            } else {
                                currentInterimTranscript += alternative.transcript;
                            }
                        }
                    }
                }
            }

            if (finalTranscript) {
                setCurrChat("userPrompt", (currChat.userPrompt || "") + finalTranscript);
            }
            if (currentInterimTranscript) {
                setTempTranscript((prev) => prev + currentInterimTranscript);
            }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === "not-allowed") {
                setToast("Microphone access denied");
                setIsMicAvailable(false);
            } else if (event.error === "no-speech") {
                setToast("No speech detected. Please try again.");
            } else {
                setToast(`Speech recognition error: ${event.error}`);
            }
            setIsListening(false);
            recognitionInstance.stop();
        };

        recognitionInstance.onend = () => {
            console.log("Speech recognition ended");
            setIsListening(false);

            if (recognitionRef.current && isListening) {
                console.log("Restarting recognition...");
                recognitionInstance.lang = browserLanguage; // Use detected language
                recognitionInstance.start();
                setIsListening(true);
            }
        };

        setRecognition(recognitionInstance);
        recognitionRef.current = recognitionInstance;
        setIsMicAvailable(true);

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            recognitionRef.current = null;
        };
    }, [setCurrChat, setToast]);//Remove Language from the useEffect

    // Effect to handle speech recognition based on isMindSpeechActive
    useEffect(() => {
        if (isMindSpeechActive) {
            startRecognition();
        } else {
            stopRecognition();
        }
    }, [isMindSpeechActive]);

    const startRecognition = () => {
        if (recognition && isMicAvailable) {
            try {
                recognition.start();
                setIsListening(true);
                console.log("Speech recognition started");
            } catch (error: any) {
                console.error("Error starting speech recognition:", error);
                setToast(`Failed to start speech recognition: ${error.message}`);
                setIsListening(false);
            }
        } else if (!isMicAvailable) {
            setToast("Microphone is not available");
        }
    };

    const stopRecognition = () => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
            console.log("Speech recognition stopped");
        }
    };

    return <></>; // Return an empty fragment.
};

export default SpeechToText;
