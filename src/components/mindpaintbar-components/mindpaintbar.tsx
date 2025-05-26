"use client";
import React, { useState, useEffect } from "react";
import MindBotZustand from "@/utils/mindbot-zustand";
import { IoMdDownload } from "react-icons/io";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { IoCopyOutline } from "react-icons/io5";

const MindPaintBar: React.FC = () => {
    const { currChat, isMindPaintOpen } = MindBotZustand();
    const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
    const [imageUrls, setImageUrls] = useState<{ [key: number]: string }>({});
    const [reactions, setReactions] = useState<{ [key: number]: { liked: boolean; disliked: boolean } }>({});

    // Function to generate image using fetch and update state
    const generateAndSetImage = async (index: number, prompt: string) => {
        if (!prompt) return; // Don't fetch if prompt is empty
        
        const generationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&model=flux-pro`;
        
        try {
            // Explicitly set loading state for this index before fetching
            setLoadingStates(prev => ({ ...prev, [index]: true })); 

            const response = await fetch(generationUrl, { 
                method: "GET", 
                mode: "cors", // Important for cross-origin requests to image APIs
                headers: {
                    // Content-Type isn't typically needed for a GET request like this,
                    // but keeping it as requested by user initially.
                    // "Content-Type": "application/json", 
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            // Update image URL and loading state
            setImageUrls(prev => ({ ...prev, [index]: objectUrl }));
            setLoadingStates(prev => ({ ...prev, [index]: false }));

        } catch (error) {
            console.error(`Error fetching image ${index}:`, error);
            setLoadingStates(prev => ({ ...prev, [index]: false })); // Stop loading on error
            // Optionally clear the image URL for this index on error
            // setImageUrls(prev => ({ ...prev, [index]: '' })); 
        }
    };

    useEffect(() => {
        // Trigger image generation when sidebar opens with a prompt OR prompt changes while sidebar is open
        if (isMindPaintOpen && currChat?.userPrompt) {
            // Set initial loading state for all images (will be individually set in fetch too)
            setLoadingStates({ 1: true, 2: true, 3: true }); 
            // Clear previous reactions and existing object URLs
            setImageUrls(prevUrls => { 
                Object.values(prevUrls).forEach(url => URL.revokeObjectURL(url)); // Clean up old URLs
                return {}; 
            });
            setReactions({});

            // Generate the 3 images
            generateAndSetImage(1, currChat.userPrompt);
            generateAndSetImage(2, currChat.userPrompt); // Call fetch for each image
            generateAndSetImage(3, currChat.userPrompt); 

        } else {
            // Clear states if sidebar is closed or no prompt exists
            setLoadingStates({});
             setImageUrls(prevUrls => { 
                Object.values(prevUrls).forEach(url => URL.revokeObjectURL(url)); // Clean up old URLs
                return {}; 
            });
            setReactions({});
        }

        // Cleanup function to revoke object URLs when component unmounts or dependencies change
        return () => {
            // Check if imageUrls is populated before trying to revoke
            if (Object.keys(imageUrls).length > 0) {
                 Object.values(imageUrls).forEach(url => {
                    // Check if url is a blob url before revoking
                    if (url && url.startsWith('blob:')) {
                         URL.revokeObjectURL(url);
                    }
                 });
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currChat?.userPrompt, isMindPaintOpen]); // Depend on both prompt and sidebar state

    const handleDownload = async (index: number) => {
        const imageUrl = imageUrls[index];
        if (!imageUrl) return;

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mindpaint-${index}-${new Date().getTime()}.jpg`;
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
        // Reconstruct the original generation URL to copy
        // Ensure currChat and userPrompt exist before attempting to copy
        if (!currChat?.userPrompt) {
            console.error("Cannot copy link: Prompt is missing.");
            return;
        }
        const generationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(currChat.userPrompt)}?nologo=true&model=flux-pro`; // Use the correct model
        
        try {
            await navigator.clipboard.writeText(generationUrl);
            // You could add a toast notification here for success
            // For example: setToast('Image link copied!'); 
        } catch (error) {
            console.error('Error copying link:', error);
             // Optionally show an error toast
            // setToast('Failed to copy link.');
        }
    };

    return (
        <section
            className={`fixed top-0 right-0 h-full w-[400px] bg-rtlLight dark:bg-rtlDark p-3 flex flex-col z-10 overflow-hidden transform transition-transform duration-300 ease-in-out ${
                isMindPaintOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
            <div className="pt-4 flex-grow flex flex-col items-center overflow-y-auto">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
                        MindPaint Results
                    </h3>
                </div>
                <div className="w-full space-y-4 mt-4 pb-4">
                    {[
                        { index: 1 },
                        { index: 2 },
                        { index: 3 }
                    ].map(({ index }) => {
                        // Use the new URL format without style modifiers and add a unique seed
                        const seed = Math.floor(Math.random() * 999) + 1; // Generate random seed between 1 and 999
                        // Try the 'turbo' model for potentially faster generation
                        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(currChat?.userPrompt || '')}&model=turbo&seed=${seed}&nologo=true`;
                        
                        return (
                            <div
                                key={index}
                                className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg relative group"
                            >
                                {currChat?.userPrompt && (
                                    <>
                                        <img
                                            src={imageUrls[index] || ''} // Use Object URL from state, provide fallback
                                            alt={`AI Generated Image ${index}`}
                                            className="w-full h-full object-cover"
                                            width={256}
                                            height={256}
                                            // Remove onLoad and onError as fetch handles this
                                            // onLoad={() => handleImageLoad(index, imageUrl)}
                                            // onError={() => handleImageError(index)}
                                        />
                                        {loadingStates[index] && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => handleDownload(index)}
                                                className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                title="Download image"
                                            >
                                                <IoMdDownload className="w-5 h-5 text-gray-800 dark:text-white" />
                                            </button>
                                            <div className="absolute bottom-2 right-2 flex gap-2">
                                                <button
                                                    onClick={() => handleReaction(index, 'like')}
                                                    className={`p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                                        reactions[index]?.liked ? 'text-blue-500' : 'text-gray-800 dark:text-white'
                                                    }`}
                                                    title="Like image"
                                                >
                                                    <FaThumbsUp className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleReaction(index, 'dislike')}
                                                    className={`p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                                        reactions[index]?.disliked ? 'text-red-500' : 'text-gray-800 dark:text-white'
                                                    }`}
                                                    title="Dislike image"
                                                >
                                                    <FaThumbsDown className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleCopyLink(index)}
                                                className="absolute bottom-2 left-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                title="Copy image link"
                                            >
                                                <IoCopyOutline className="w-5 h-5 text-gray-800 dark:text-white" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default MindPaintBar;
