// InputActions.tsx

"use client";
import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import DevButton from "../dev-components/dev-button";
import MindBotZustand from "@/utils/mindbot-zustand";
import ReactTooltip from "../dev-components/react-tooltip";
import { LuGlobe } from "react-icons/lu";
import { TbTelescope } from "react-icons/tb";
import { TbGridScan } from "react-icons/tb";
import { HiPaperClip } from "react-icons/hi";
import { TbPhotoEdit } from "react-icons/tb";
import { RiBarChartBoxLine } from "react-icons/ri";
import { FaRegLightbulb, FaArrowCircleUp } from "react-icons/fa";
import SpeechToText from "@/components/chat-provider-components/speech-to-text"; // Make sure this path is correct
import { TbPhotoAi } from "react-icons/tb";

// Add 'mindcanvas' and 'mindspeech'
type ThinkingMode = 'none' | 'thinking' | 'mindsearch' | 'deepsearch' | 'mindpaint' | 'mindstyle' | 'mindcanvas' | 'mindspeech';

interface InputActionsProps {
  handleImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  generateMsg: (thinkingActive: boolean, searchType: 'mindsearch' | 'deepsearch' | null) => Promise<void>;
  isThinkingActive: boolean;
  toggleThinking: () => void;
  activeSearchMode: string | null;
  handleMindSearch: () => void;
  handleDeepSearch: () => void;
  handleCancel: () => void;
  toggleMindPaint: () => void;
  toggleMindStyle?: () => void; // Optional for backward compatibility
}

const InputActions: React.FC<InputActionsProps> = ({
    generateMsg,
    handleImageUpload,
    isThinkingActive,
    toggleThinking,
    activeSearchMode,
    handleMindSearch,
    handleDeepSearch,
    handleCancel,
    toggleMindPaint,
    toggleMindStyle
}) => {
    const { currChat, setCurrChat, msgLoader, isMindStyleOpen, isMindCanvasOpen, toggleMindCanvas } = MindBotZustand();
    const [activeThinkingMode, setActiveThinkingMode] = useState<ThinkingMode>('none');

    const enableSubmitButton =
        !msgLoader &&
        currChat &&
        Object.keys(currChat).length > 0 &&
        currChat?.userPrompt != null;

    // Centralized function to handle mode toggling
    const handleModeToggle = (mode: ThinkingMode) => {
        const newMode = activeThinkingMode === mode ? 'none' : mode;
        setActiveThinkingMode(newMode);

        // Call specific functions based on mode activation/deactivation
        switch (mode) {
            case 'thinking':
                toggleThinking(); // Assumes toggleThinking handles both activation/deactivation state if needed externally
                break;
            case 'mindsearch':
                if (newMode === 'mindsearch') handleMindSearch(); // Call only on activation
                else if (newMode === 'none') handleCancel(); // Optional: Call cancel when deselecting? Based on original logic.
                break;
            case 'deepsearch':
                if (newMode === 'deepsearch') handleDeepSearch(); // Call only on activation
                else if (newMode === 'none') handleCancel(); // Optional: Call cancel when deselecting? Based on original logic.
                break;
            case 'mindpaint':
                toggleMindPaint(); // This likely handles the paint state itself
                if (newMode === 'none') handleCancel(); // Call cancel on deactivation
                break;
            case 'mindstyle':
                if (toggleMindStyle) toggleMindStyle(); // This likely handles the style state itself
                if (newMode === 'none') handleCancel(); // Call cancel on deactivation
                break;
            case 'mindcanvas':
                toggleMindCanvas(); // Toggle the actual sidebar state in Zustand
                if (newMode === 'none') handleCancel(); // Call cancel on deactivation
                break;
            case 'mindspeech':
                // No extra function needed here, state change handles SpeechToText rendering
                 if (newMode === 'none') handleCancel(); // Call cancel on deactivation
                break;
        }

         // If activating any mode other than 'none', call handleCancel to ensure conflicting states are reset
        if (newMode !== 'none' && newMode !== mode) {
             // This condition might be complex. Let's rethink if we need a general cancel here.
             // The individual case 'none' logic seems sufficient.
        }
         // If activating any mode, potentially cancel others?
        // Let's rely on setActiveThinkingMode to manage the single active state for now.
        // The original handleCancel seemed tied to specific actions closing.
    };

    // Effect to sync activeThinkingMode if external state changes (e.g., sidebar closed directly)
    useEffect(() => {
        if (activeSearchMode !== 'mindsearch' && activeThinkingMode === 'mindsearch') {
            setActiveThinkingMode('none');
        }
        if (activeSearchMode !== 'deepsearch' && activeThinkingMode === 'deepsearch') {
            setActiveThinkingMode('none');
        }
    }, [activeSearchMode]); // Keep this for search modes

    useEffect(() => {
        if (isMindStyleOpen && activeThinkingMode !== 'mindstyle') {
            setActiveThinkingMode('mindstyle');
        } else if (!isMindStyleOpen && activeThinkingMode === 'mindstyle') {
             setActiveThinkingMode('none');
        }
    }, [isMindStyleOpen]); // Keep this for MindStyle sync

    useEffect(() => {
        // Sync MindCanvas icon with sidebar state if it's closed externally
        if (!isMindCanvasOpen && activeThinkingMode === 'mindcanvas') {
            setActiveThinkingMode('none');
        }
        // Optional: If sidebar opens externally, activate icon?
        // else if (isMindCanvasOpen && activeThinkingMode !== 'mindcanvas') {
        //     setActiveThinkingMode('mindcanvas');
        // }
    }, [isMindCanvasOpen]);

    // Derive boolean flags directly from activeThinkingMode
    const isThinkingActiveLocal = activeThinkingMode === 'thinking';
    const isMindSearchActive = activeThinkingMode === 'mindsearch';
    const isDeepSearchActive = activeThinkingMode === 'deepsearch';
    const isMindPaintActive = activeThinkingMode === 'mindpaint';
    const isMindStyleActive = activeThinkingMode === 'mindstyle';
    const isMindCanvasActive = activeThinkingMode === 'mindcanvas'; // Use this for style
    const isMindSpeechActiveLocal = activeThinkingMode === 'mindspeech'; // Use this for style and render

    return (
        <div className="flex justify-between items-center">
            {/* Left side actions */}
            <div className="flex items-center justify-start">
                 <ReactTooltip tipData="Upload files">
                    <DevButton
                        className="p-3 relative"
                        rounded="full"
                        variant="v3"
                        asIcon
                    >
                        <input
                            type="file"
                            id="file-input-files"
                            className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                            onChange={handleImageUpload}
                            accept="image/*, application/pdf, video/*, audio/*, text/plain, text/csv, .csv"
                        />
                        <HiPaperClip className="text-2xl text-black dark:text-white" />
                    </DevButton>
                </ReactTooltip>

                <ReactTooltip tipData="MindSearch-2.0">
                    <DevButton
                        className="p-3 relative"
                        rounded="full"
                        variant="v3"
                        asIcon
                        onClick={() => handleModeToggle('mindsearch')} // Use central handler
                    >
                        <LuGlobe
                            className={`text-2xl transition-colors ${
                                isMindSearchActive ? "text-blue-500" : "text-black dark:text-white"
                            }`}
                        />
                    </DevButton>
                </ReactTooltip>

                <ReactTooltip tipData="DeepSearch-1.0">
                    <DevButton
                        className="p-3 relative"
                        rounded="full"
                        variant="v3"
                        asIcon
                        onClick={() => handleModeToggle('deepsearch')} // Use central handler
                    >
                        <TbTelescope
                            className={`text-2xl transition-colors ${
                                isDeepSearchActive ? "text-blue-500" : "text-black dark:text-white"
                            }`}
                        />
                    </DevButton>
                </ReactTooltip>

                <ReactTooltip tipData="MindThink-A2">
                    <DevButton
                        className="p-3 relative"
                        rounded="full"
                        variant="v3"
                        asIcon
                         onClick={() => handleModeToggle('thinking')} // Use central handler
                    >
                        <FaRegLightbulb
                            className={`text-2xl transition-colors ${isThinkingActiveLocal ? "text-blue-500" : "text-black dark:text-white"}`}
                        />
                     </DevButton>
                 </ReactTooltip>

                 <ReactTooltip tipData="MindPaint-2.0">
                    <DevButton
                        className="p-3 relative"
                        rounded="full"
                        variant="v3"
                        asIcon
                        onClick={() => handleModeToggle('mindpaint')} // Use central handler
                    >
                        <TbPhotoAi
                            className={`text-2xl transition-colors ${isMindPaintActive ? "text-blue-500" : "text-black dark:text-white"}`}
                        />
                    </DevButton>
                </ReactTooltip>
                <ReactTooltip tipData="MindStyle-2.0">
                    <DevButton
                        className="p-3 relative"
                        rounded="full"
                        variant="v3"
                        asIcon
                         onClick={() => handleModeToggle('mindstyle')} // Use central handler
                    >
                        <TbPhotoEdit
                            className={`text-2xl transition-colors ${isMindStyleActive ? "text-blue-500" : "text-black dark:text-white"}`}
                        />
                    </DevButton>
                </ReactTooltip>
                <ReactTooltip tipData="MindAnalysis-1.0">
                    <DevButton
                        className="p-3 relative"
                        rounded="full"
                        variant="v3"
                        asIcon
                        onClick={() => handleModeToggle('mindcanvas')} // Use central handler
                    >
                        <TbGridScan
                            className={`text-2xl transition-colors ${isMindCanvasActive ? "text-blue-500" : "text-black dark:text-white"}`}
                        />
                    </DevButton>
                </ReactTooltip>
            </div> {/* End Left side actions div */}

            {/* Right side actions */}
             <div className="flex items-center justify-end">

                 {/* Render SpeechToText based on activeThinkingMode */}
                 {activeThinkingMode === 'mindspeech' && (
                    <SpeechToText
                        setCurrChat={setCurrChat}
                        isMindSpeechActive={true} // Pass true when rendered
                        onClose={() => handleModeToggle('mindspeech')} // Allow STT component to deactivate mode
                    />
                 )}

                 {/* Use derived boolean for tooltip and style */}
                 <ReactTooltip tipData={isMindSpeechActiveLocal ? "Stop Listening" : "MindSpeech"}>
                    <DevButton
                        className="p-3 relative"
                        rounded="full"
                        variant="v3"
                        asIcon
                        onClick={() => handleModeToggle('mindspeech')} // Use central handler
                    >
                        {/* Microphone SVG Icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className={`size-6 transition-colors ${isMindSpeechActiveLocal ? "text-blue-500 animate-pulse" : "text-black dark:text-white"}`} // Use derived boolean
                            aria-hidden="true"
                            fill="currentColor"
                        >
                            {/* Mic paths */}
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M16.7673 6.54284C16.7673 3.91128 14.634 1.77799 12.0024 1.77799C9.37089 1.77799 7.2376 3.91129 7.2376 6.54284V13.5647C7.2376 16.1963 9.37089 18.3296 12.0024 18.3296C14.634 18.3296 16.7673 16.1963 16.7673 13.5647V6.54284ZM12.0024 3.28268C13.803 3.28268 15.2626 4.7423 15.2626 6.54284V13.5647C15.2626 15.3652 13.803 16.8249 12.0024 16.8249C10.2019 16.8249 8.74229 15.3652 8.74229 13.5647V6.54284C8.74229 4.7423 10.2019 3.28268 12.0024 3.28268Z"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="1.25" // Reduced to 1.25
                            ></path>
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M20.0274 8.79987C19.6119 8.79987 19.2751 9.1367 19.2751 9.55221V13.5647C19.2751 17.5813 16.019 20.8374 12.0024 20.8374C7.98587 20.8374 4.72979 17.5813 4.72979 13.5647V9.55221C4.72979 9.1367 4.39295 8.79987 3.97744 8.79987C3.56193 8.79987 3.2251 9.1367 3.2251 9.55221V13.5647C3.2251 18.4123 7.15485 22.3421 12.0024 22.3421C16.85 22.3421 20.7798 18.4123 20.7798 13.5647V9.55221C20.7798 9.1367 20.443 8.79987 20.0274 8.79987Z"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="1.25" // Reduced to 1.25
                            ></path>
                        </svg>
                    </DevButton>
                </ReactTooltip>

                <ReactTooltip tipData="Submit">
                     <DevButton
                        asIcon
                         // Pass null for searchType if none of the search modes are active
                        onClick={() => generateMsg(isThinkingActiveLocal, isMindSearchActive ? 'mindsearch' : isDeepSearchActive ? 'deepsearch' : null)}
                        type="submit"
                        rounded="full"
                         className={`overflow-hidden transform origin-right p-2 transition-all duration-300 ease-in-out ${enableSubmitButton
                                ? "w-auto scale-100 pointer-events-auto ml-2 opacity-100"
                                : "w-0 scale-0 pointer-events-none ml-0 opacity-0"
                            } hover:bg-transparent active:bg-transparent`}
                        disabled={!enableSubmitButton}
                    >
                        <FaArrowCircleUp className="text-3xl text-black dark:text-white" />
                    </DevButton>
                </ReactTooltip>
            </div> {/* End Right side actions div */}
        </div>
    );
};

export default InputActions;
