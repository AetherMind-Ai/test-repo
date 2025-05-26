"use client";
import React, { useState, useEffect } from "react";
import MindBotZustand from "@/utils/mindbot-zustand";
import { IoMdDownload } from "react-icons/io";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { IoCopyOutline } from "react-icons/io5";

const MindPaintBar = () => {
  const { currChat, isMindPaintOpen } = MindBotZustand();
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [imageUrls, setImageUrls] = useState<{ [key: number]: string }>({});
  const [reactions, setReactions] = useState<{ [key: number]: { liked: boolean; disliked: boolean } }>({});

  useEffect(() => {
    if (isMindPaintOpen && currChat?.userPrompt) {
      setLoadingStates({ 1: true, 2: true });
      setImageUrls({});
      setReactions({});

      // Generate two different images with slightly modified prompts
      const generateImage = async (index: number, modifier: string) => {
        const modifiedPrompt = `${currChat.userPrompt} ${modifier}`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(modifiedPrompt)}?nologo=true&model=flux-pro&seed=${Math.random()}`;
        
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error('Failed to generate image');
          
          setImageUrls(prev => ({ ...prev, [index]: imageUrl }));
        } catch (error) {
          console.error(`Error generating image ${index}:`, error);
        } finally {
          setLoadingStates(prev => ({ ...prev, [index]: false }));
        }
      };

      generateImage(1, "artistic style");
      generateImage(2, "realistic style");
    }
  }, [currChat?.userPrompt, isMindPaintOpen]);

  const handleDownload = async (index: number) => {
    const imageUrl = imageUrls[index];
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindpaint-${index}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleReaction = (index: number, type: 'like' | 'dislike') => {
    setReactions(prev => ({
      ...prev,
      [index]: {
        liked: type === 'like' ? !prev[index]?.liked : false,
        disliked: type === 'dislike' ? !prev[index]?.disliked : false
      }
    }));
  };

  const handleCopyLink = async (index: number) => {
    const imageUrl = imageUrls[index];
    if (!imageUrl) return;
    
    try {
      await navigator.clipboard.writeText(imageUrl);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  if (!isMindPaintOpen) return null;

  return (
    <section className="fixed top-0 right-0 h-full w-[400px] bg-rtlLight dark:bg-rtlDark p-3 flex flex-col z-10 overflow-hidden transform transition-transform duration-300 ease-in-out translate-x-0">
      <div className="pt-4 flex-grow flex flex-col items-center">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-black dark:text-white">MindPaint Results</h3>
          {Object.values(loadingStates).some(state => state) && (
            <div className="mt-4 flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Generating Images...</p>
            </div>
          )}
        </div>

        <div className="w-full space-y-6">
          {[1, 2].map((index) => (
            <div key={index} className="relative group">
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg">
                {imageUrls[index] ? (
                  <img
                    src={imageUrls[index]}
                    alt={`Generated Image ${index}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {loadingStates[index] ? "Generating..." : "Image will appear here"}
                    </p>
                  </div>
                )}

                {imageUrls[index] && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(index)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <IoMdDownload className="w-6 h-6 text-gray-800 dark:text-white" />
                      </button>
                      <button
                        onClick={() => handleReaction(index, 'like')}
                        className={`p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          reactions[index]?.liked ? 'text-blue-500' : 'text-gray-800 dark:text-white'
                        }`}
                      >
                        <FaThumbsUp className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleReaction(index, 'dislike')}
                        className={`p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          reactions[index]?.disliked ? 'text-red-500' : 'text-gray-800 dark:text-white'
                        }`}
                      >
                        <FaThumbsDown className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleCopyLink(index)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <IoCopyOutline className="w-6 h-6 text-gray-800 dark:text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {imageUrls[1] && imageUrls[2] && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              I've generated two unique interpretations of your prompt using different artistic styles. 
              The first image emphasizes artistic elements while the second focuses on realism. 
              Feel free to download, share, or react to the images that resonate with you!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MindPaintBar;