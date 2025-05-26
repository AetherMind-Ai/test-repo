// ChatProvider.tsx

"use client";
import React, { useEffect, useRef, useCallback, useState } from "react";
import CodeBlock from "@/components/chat-provider-components/code-block";
import {
    BubbleMenu,
    EditorContent,
    ReactNodeViewRenderer,
    useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight";
import { Markdown as TipTapMkd } from "tiptap-markdown";
import { FormatOutput } from "@/utils/shadow";
import root from "react-shadow/styled-components";
import { GoogleGenerativeAI } from "@google/generative-ai";
import geminiZustand from "@/utils/mindbot-zustand";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { createPortal } from "react-dom";
import { updateResponse } from "@/actions/actions";
import DevButton from "../dev-components/dev-button";
import {
    MdOutlineModeEditOutline,
} from "react-icons/md";
import { FaRegFileAlt } from "react-icons/fa";
import Image from "next/image";
import ReactTooltip from "../dev-components/react-tooltip";
import TextToSpeech from "./text-to-speech";
import ChatActionsBtns from "./chat-actions-btns";
import { BsImage } from "react-icons/bs";

const extensions = [
    StarterKit,
    TipTapMkd,
    CodeBlockLowlight.extend({
        addNodeView: () => ReactNodeViewRenderer(CodeBlock),
    }).configure({ lowlight }),
];

const PROMPT_TYPES = {
    Longer: "Lengthen",
    Shorter: "Shorten",
    Regenerate: "Regenerate",
    Remove: "Remove",
    Simplify: "Simplify",
    Elaborate: "Elaborate on",
    Formalize: "Make more formal",
    Casual: "Make more casual",
    Persuasive: "Make more persuasive",
    Technical: "Add more technical details to",
    Metaphor: "Add a metaphor to",
    Examples: "Add relevant examples to",
    Counterargument: "Add a counterargument to",
    Summary: "Summarize",
};

interface ChatProviderProps {
    llmResponse: string;
    chatUniqueId: string;
    userPrompt: string;
    imgName?: string;
    imgInfo: { imgSrc: string; imgAlt: string };
    mindsearchActive: boolean;  // Added mindsearchActive prop
}

const ChatProvider: React.FC<ChatProviderProps> = ({
    llmResponse,
    chatUniqueId,
    userPrompt,
    imgName,
    imgInfo,
    mindsearchActive,  // Destructured mindsearchActive prop
}) => {
    const { topLoader, setCurrChat, setTopLoader, currChat } = geminiZustand();
    const [dropdown, setDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const [searchSources, setSearchSources] = useState<string[]>([]);
    const [initialResponse, setInitialResponse] = useState(llmResponse);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [selectedNode, setSelectedNode] = useState("");
    const [updateLoader, setUpdateLoader] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [initialPrompt, setInitialPrompt] = useState(userPrompt);
    const [promptModify, setPromptModify] = useState(false);
    const [serperImages, setSerperImages] = useState<string[]>([]);  // New state for images
    const [serperVideo, setSerperVideo] = useState<string | null>(null); // New state for video

    const dropdownRef = useRef<HTMLDivElement>(null);
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const editor = useEditor({
        extensions,
        content: initialResponse,
        // Removed onUpdate as it can cause a race condition and prevent quick updates.
    });

    const handleSelectNode = useCallback(() => {
        if (!editor) return; // Ensure editor is initialized
        const { state } = editor;
        const { from, to } = state.selection;
        const selectedNode = state.doc.textBetween(from, to, " ");
        setSelectedNode(selectedNode);
    }, [editor]); // Add editor to useCallback dependencies

    const handlePrompt = useCallback(
        async (promptType: keyof typeof PROMPT_TYPES | "Custom") => {
            if (!editor) return; // Ensure editor is initialized

            let prompt;
            if (promptType === "Custom") {
                prompt = `This is the whole response: ${initialResponse}. ${
                    inputRef.current?.value
                } Specifically focus on this part: "${selectedNode}". Ensure the modified part aligns seamlessly with the rest of the response. Provide the entire modified response back, preserving the essential introductory and concluding phrases without adding any new non-contextual information.`;
            } else {
                const promptInstructions = {
                    Longer: "Lengthen",
                    Shorter: "Shorten",
                    Regenerate: "Regenerate",
                    Remove: "Remove",
                    Simplify: "Simplify the language of",
                    Elaborate: "Elaborate on",
                    Formalize: "Rewrite in a more formal tone",
                    Casual: "Make more casual",
                    Persuasive: "Rewrite to be more persuasive",
                    Technical: "Add more technical details to",
                    Metaphor: "Incorporate a relevant metaphor into",
                    Examples: "Add relevant examples to",
                    Counterargument: "Present a counterargument to",
                    Summary: "Summarize",
                };
                prompt = `This is the whole response: ${initialResponse}. ${
                    promptInstructions[promptType]
                } a specific part of the response, specifically "${selectedNode}". Ensure it aligns seamlessly with the rest of the response. Provide the entire modified response back, preserving the essential introductory and concluding phrases without adding any new non-contextual information.`;
            }

            try {
                setUpdateLoader(true);

                // Optimistic Update: Immediately update the editor with a loading state.
                setInitialResponse("Loading...");
                editor.commands.setContent("Loading...");

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                if (!text) throw new Error("Error while generating prompt");

                // Immediately update the editor with the new content.
                setInitialResponse(text);
                editor.commands.setContent(text);

                // Asynchronous Update:  Update the database in the background.  This avoids blocking the UI.
                updateResponse({ chatUniqueId, updatedResponse: text })
                    .then(() => {
                        // Optional: Handle success (e.g., logging).
                    })
                    .catch((error) => {
                        console.error("Error updating database:", error);
                        // Optional: Revert to previous content if database update fails.
                    });

                setDropdown(false);
            } catch (error) {
                console.error("Error generating response:", error);
                //If the gemini call fails, we should notify the user of the error.
                setInitialResponse("Error generating response.");
                editor.commands.setContent("Error generating response.");

                // Optional: Display an error message to the user.
            } finally {
                setUpdateLoader(false);
            }
        },
        [editor, initialResponse, selectedNode, chatUniqueId, model]
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleButtonClick = () => {
        handleSelectNode();
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
            });
            setDropdown(true);
        }
    };
    const DropdownContent = () => (
        <div
            className={`${updateLoader && "dropdown-loader pointer-events-none "
                } p-[3px] bg-rtlLight dark:bg-rtlDark rounded-xl shadow-md absolute z-50`}
            style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
            }}
            ref={dropdownRef}
        >
            <div className=" flex flex-col rounded-xl p-3 bg-rtlLight dark:bg-rtlDark max-h-52 overflow-hidden">
                <input
                    ref={inputRef}
                    onKeyDown={(e) => {
                        e.key === "Enter" && handlePrompt("Custom");
                    }}
                    type="text"
                    className="p-2 rounded-lg w-full outline-none "
                    placeholder="Modify with a prompt"
                />
                <div className="flex flex-col mt-2 flex-grow overflow-y-auto">
                    {Object.keys(PROMPT_TYPES).map((type) => (
                        <button
                            onClick={() => handlePrompt(type as keyof typeof PROMPT_TYPES)}
                            className="p-1 px-2 rounded-lg hover:bg-accentGray/10 outline-none text-left text-sm"
                            key={type}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const handleToSetPrompt = () => {
        if (initialPrompt) {
            setCurrChat("userPrompt", initialPrompt);
            setPromptModify(false);
            setInitialPrompt(userPrompt);
        }
    };
    const handleTxtToSpeech = () => {
        return editor?.getText() as string;
    };

    // ** SERPER IMAGE SEARCH INTEGRATION **
    const fetchSerperImages = useCallback(async (query: string) => {
        const apiKey = "b8b7b04df29e33811fb158cd3590f2a4c1cb7212";  // Actual API Key

        if (!apiKey) {
            console.error("Serper API key not found.");
            return;
        }

        const apiUrl = "https://google.serper.dev/images";

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": apiKey,
                },
                body: JSON.stringify({
                    q: query,
                    num: 3,  // Request 3 images
                }),
            });

            if (!response.ok) {
                console.error("Serper API Error:", response.statusText);
                setSerperImages([]);
                return;
            }

            const data = await response.json();

            if (data.images && Array.isArray(data.images)) {
                // Extract the image URLs from the response and update state
                const imageUrls = data.images.map((image: any) => image.imageUrl);
                setSerperImages(imageUrls);
            } else {
                console.warn("No images found in Serper API response.");
                setSerperImages([]); // Clear any previous images
            }
        } catch (error) {
            console.error("Error fetching Serper images:", error);
            setSerperImages([]);
        }
    }, []);

    // ** SERPER VIDEO SEARCH INTEGRATION **
    const fetchSerperVideo = useCallback(async (query: string) => {
        const apiKey = "b8b7b04df29e33811fb158cd3590f2a4c1cb7212";  // Actual API Key

        if (!apiKey) {
            console.error("Serper API key not found.");
            return;
        }

        const apiUrl = "https://google.serper.dev/search";

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": apiKey,
                },
                body: JSON.stringify({
                    q: `${query} site:youtube.com`,
                    num: 1
                }),
            });

            if (!response.ok) {
                console.error("Serper API Error:", response.statusText);
                setSerperVideo(null);
                return;
            }

            const data = await response.json();
            const videoLink = data?.organic?.[0]?.link;

            if (videoLink) {
                setSerperVideo(videoLink);
            } else {
                console.warn("No video found in Serper API response.");
                setSerperVideo(null);
            }
        } catch (error) {
            console.error("Error fetching Serper video:", error);
            setSerperVideo(null);
        }
    }, []);


    useEffect(() => {
        if (mindsearchActive && userPrompt) {
            fetchSerperImages(userPrompt);
            fetchSerperVideo(userPrompt);
        } else {
            setSerperImages([]);  // Clear images when mindsearch is not active
            setSerperVideo(null); // Clear video when mindsearch is not active
        }
    }, [mindsearchActive, userPrompt, fetchSerperImages, fetchSerperVideo]);

    useEffect(() => {
        // Extract search sources from userPrompt (example)
        if (userPrompt) {
            const match = userPrompt.match(/\[(.*?)\]/);
            if (match && match[1]) {
                const sourcesString = match[1];
                const sources = sourcesString.split(",").map(source => source.trim());
                setSearchSources(sources);
            } else {
                setSearchSources([]);
            }
        } else {
            setSearchSources([]);
        }
    }, [userPrompt]);

    return (
        <>
            <div className="w-full h-fit flex items-start gap-3 group relative">
                <Image
                    src={imgInfo.imgSrc}
                    alt={imgInfo.imgAlt}
                    width={45}
                    height={45}
                    className="rounded-full cursor-pointer"
                />
                <textarea
                    className={`prompt-area pt-1 text-base border-2 resize-none rounded-md bg-transparent outline-none ${promptModify
                        ? " max-h-none w-full !p-3 focus:border-accentBlue/70  border-accentGray "
                        : " max-h-40 border-transparent"
                    }`}
                    readOnly={!promptModify}
                    onChange={(e) => setInitialPrompt(e.target.value)}
                    value={initialPrompt}
                    style={{ width: '85%' }}  // Set the width of the textarea to 85%
                />

                <ReactTooltip tipData="edit prompt" place="bottom">
                    <DevButton
                        onClick={() => setPromptModify(!promptModify)}
                        rounded="full"
                        variant="v1"
                        className="text-xl p-[6px] opacity-80 hidden group-hover:block"
                        asIcon
                    >
                        <MdOutlineModeEditOutline />
                    </DevButton>
                </ReactTooltip>
            </div>
            {promptModify && (
                <div className="flex item-center gap-2 p-10 pt-2">
                    {" "}
                    <DevButton
                        onClick={() => {
                            setInitialPrompt(userPrompt);
                            setPromptModify(false);
                            setCurrChat("userPrompt", null);
                        }}
                        rounded="full"
                        variant="v3"
                        className="text-accentBlue px-4"
                    >
                        Cancel
                    </DevButton>
                    <DevButton
                        onClick={handleToSetPrompt}
                        disabled={userPrompt === initialPrompt}
                        rounded="full"
                        className={`text-accentBlue !bg-accentBlue/30 px-4 ${userPrompt === initialPrompt && " opacity-60 "
                            }`}
                    >
                        Update
                    </DevButton>
                </div>
            )}

            {/*  SERPER IMAGES DISPLAY (Between user prompt and LLM response) */}
            {mindsearchActive && serperImages.length > 0 && (
                <div className="flex justify-around mt-4">
                    {serperImages.map((imageUrl, index) => (
                        <Image
                            key={index}
                            src={imageUrl}
                            alt={`Serper Image ${index + 1}`}
                            width={120}
                            height={120}
                            className="object-cover rounded-md"
                        />
                    ))}
                </div>
            )}

            {imgName && (
                <div className="w-full mt-3 overflow-hidden ">
                    <div className="p-4 w-fit max-w-full bg-rtlLight dark:bg-rtlDark rounded-md flex items-start gap-2">
                        <FaRegFileAlt className="text-4xl" />
                        <p className="text-lg truncate"> {imgName}</p>
                    </div>
                </div>
            )}
            <div className="w-full flex justify-end h-16 items-center">
                <TextToSpeech handleTxtToSpeech={handleTxtToSpeech} />
            </div>

            <div className="flex md:flex-row flex-col w-full items-start gap-4">
                <Image
                    src="/favicon.ico"
                    alt="Favicon"
                    width={45}
                    height={45}
                    className="transition-all duration-500 w-[45px] h-[45px]"
                />
                <root.div className="w-full shadowDiv -translate-y-4">
                    <FormatOutput>
                        <BubbleMenu editor={editor}>
                            {!dropdown && (
                                <button
                                    ref={buttonRef}
                                    onClick={handleButtonClick}
                                    style={{
                                        fontSize: "1rem",
                                        color: "white",
                                        padding: "10px",
                                        borderRadius: "50%",
                                        border: "none",
                                        aspectRatio: "1/1",
                                        cursor: "pointer",
                                        height: "2.5rem",
                                        backgroundColor: "#334155",
                                    }}
                                >
                                    <FaWandMagicSparkles />
                                </button>
                            )}
                        </BubbleMenu>
                        <EditorContent spellCheck={false} editor={editor} />
                    </FormatOutput>
                </root.div>
            </div>

            <ChatActionsBtns
                chatID={chatUniqueId}
                userPrompt={userPrompt}
                llmResponse={llmResponse}
                shareMsg={`user prompt: ${userPrompt} \n\n MindBot response:${handleTxtToSpeech()}`}
            />

            {/* YOUTUBE VIDEO DISPLAY (Below LLM response) */}
            {mindsearchActive && serperVideo && (
                <div className="mt-4">
                    <div className="aspect-w-16 aspect-h-9">
                        <iframe
                            src={serperVideo}
                            title="YouTube video"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}

            {dropdown && createPortal(<DropdownContent />, document.body)}
        </>
    );
};

export default ChatProvider;
