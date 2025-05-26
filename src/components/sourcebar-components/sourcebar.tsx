"use client";
import React, { useState, useEffect, useRef } from "react";
import SearchResults from "./SearchResults";
import MindBotZustand from "@/utils/mindbot-zustand";
import axios from "axios";

interface SearchResult {
  title: string;
  websiteName: string;
  websiteURL: string;
  favicon: string;
}

interface SourcebarProps {
  isActive: boolean;
}

const Sourcebar: React.FC<SourcebarProps> = ({ isActive }) => {
  const [isOpen, setIsOpen] = useState(isActive);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [aiResponse, setAiResponse] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { currChat, activeSearchMode } = MindBotZustand();
  const apiKey = process.env.NEXT_PUBLIC_SERPER_API_KEY;
  const [prompt, setPrompt] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (activeSearchMode === "mindsearch" || activeSearchMode === "deepsearch") {
      setPrompt(currChat.userPrompt);
    } else {
      setPrompt(null);
    }
  }, [activeSearchMode, currChat.userPrompt]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isActive) {
      setLoading(true);
      timerRef.current = setTimeout(() => {
        setLoading(false);
        timerRef.current = null;
      }, 3000);
    } else {
      setLoading(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (prompt && apiKey) {
        try {
          const response = await axios.post(
            "https://google.serper.dev/search",
            { q: prompt },
            {
              headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
              },
            }
          );
          const results = response.data.organic || [];

          const sources = results.slice(0, 10).map((result: any) => ({
            title: result.title,
            websiteName: new URL(result.link).hostname,
            websiteURL: result.link,
            favicon: `https://www.google.com/s2/favicons?sz=64&domain_url=${result.link}`,
          }));
          setSearchResults(sources);

          try {
            const aiResponse = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
              {
                contents: [{ parts: [{ text: prompt }] }],
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            setAiResponse(aiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to fetch AI response.");
          } catch (error) {
            console.error("Error fetching AI response:", error);
            setAiResponse("Failed to fetch AI response.");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };

    fetchSearchResults();
  }, [prompt, apiKey]);

  return (
    <section
      className={`fixed top-0 right-0 h-full w-[400px] bg-rtlLight dark:bg-rtlDark p-3 flex flex-col z-10 overflow-hidden transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="pt-4 flex-grow flex flex-col items-center">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <SearchResults prompt={prompt} />
        )}
      </div>
    </section>
  );
};

export default Sourcebar;
