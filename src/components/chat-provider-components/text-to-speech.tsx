"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import DevButton from "../dev-components/dev-button";
import { BiSolidVolumeFull } from "react-icons/bi";
import { IoPauseSharp } from "react-icons/io5";
import ReactTooltip from "../dev-components/react-tooltip";

const TextToSpeech = ({
  handleTxtToSpeech,
}: {
  handleTxtToSpeech: () => string;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(
    typeof window !== "undefined" && "speechSynthesis" in window
      ? new SpeechSynthesisUtterance("")
      : null
  );
  const synthRef = useRef<SpeechSynthesis | null>(
    typeof window !== "undefined" && "speechSynthesis" in window
      ? window.speechSynthesis
      : null
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const detectLanguage = useCallback((text: string): "ar-EG" | "en-US" => {
    const arabicRegex = /[\u0600-\u06FF]/; // Basic Arabic character range
    return arabicRegex.test(text) ? "ar-EG" : "en-US";
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      const availableVoices = synthRef.current.getVoices();
      setVoices(availableVoices);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (utteranceRef.current) {
      const text = handleTxtToSpeech();
      utteranceRef.current.text = text;
      utteranceRef.current.lang = detectLanguage(text);

      // Handle Arabic and English voices
      if (detectLanguage(text) === "ar-EG") {
        const arabicVoice = voices.find(
          (voice) =>
            voice.lang === "ar-EG" && voice.name.toLowerCase().includes("male")
        );

        // Set the highest quality Arabic voice
        if (arabicVoice) {
          utteranceRef.current.voice = arabicVoice;
          utteranceRef.current.pitch = 1.0; // Natural tone
          utteranceRef.current.rate = 0.95; // Slightly slower for clarity
          utteranceRef.current.volume = 1.0; // Max volume
        }
      } else if (detectLanguage(text) === "en-US") {
        const englishVoice = voices.find(
          (voice) =>
            voice.lang === "en-US" && voice.name.toLowerCase().includes("male")
        );

        // Set the highest quality English voice
        if (englishVoice) {
          utteranceRef.current.voice = englishVoice;
          utteranceRef.current.pitch = 1.1; // Slightly energetic tone
          utteranceRef.current.rate = 1.0; // Natural speed
          utteranceRef.current.volume = 1.0; // Max volume
        }
      }

      // Event handlers for TTS
      utteranceRef.current.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utteranceRef.current.onpause = () => {
        setIsPlaying(false);
        setIsPaused(true);
      };

      utteranceRef.current.onresume = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
    }
  }, [handleTxtToSpeech, voices, detectLanguage]);

  const handlePlay = () => {
    if (!utteranceRef.current || !synthRef.current) {
      return;
    }
    if (isPaused) {
      synthRef.current.resume();
    } else {
      if (isPlaying) {
        synthRef.current.cancel();
      }
      synthRef.current.speak(utteranceRef.current);
    }

    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="flex space-x-2 text-xl opacity-80">
      {isPlaying ? (
        <ReactTooltip tipData="cancel">
          <DevButton
            variant="v3"
            size="xl"
            rounded="full"
            asIcon
            onClick={handleStop}
          >
            <IoPauseSharp />
          </DevButton>
        </ReactTooltip>
      ) : (
        <ReactTooltip tipData="listen">
          <DevButton
            variant="v3"
            size="xl"
            rounded="full"
            asIcon
            onClick={handlePlay}
          >
            <BiSolidVolumeFull />
          </DevButton>
        </ReactTooltip>
      )}
    </div>
  );
};

export default TextToSpeech;
