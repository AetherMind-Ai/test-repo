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
import { GoogleGenerativeAI } from "@google/genai";
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
import { FiClock } from "react-icons/fi";

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
    Metaphor: "Incorporate a relevant metaphor into",
    Examples: "Add relevant examples to",
    Counterargument: "Present a counterargument to",
    Summary: "Summarize",
};

interface ChatProviderProps {
    llmResponse: string;
    chatUniqueId: string;
    userPrompt: string;
    imgName?: string;
    imgInfo: { imgSrc: string; imgAlt: string };
    mindsearchActive: boolean;
}

const ChatProvider: React.FC<ChatProviderProps> = ({
    llmResponse,
    chatUniqueId,
    userPrompt,
    imgName,
    imgInfo,
    mindsearchActive,
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
    const [serperImages, setSerperImages] = useState<string[]>([]);
    const [modificationTime, setModificationTime] = useState<number | null>(null);
    const [thinkingText, setThinkingText] = useState<string | null>(null);
    const [thinkingTime, setThinkingTime] = useState<number>(0);
    const [isThinking, setIsThinking] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    useEffect(() => {
        // Load saved images from localStorage
        const savedImages = localStorage.getItem(`mindpaint_${chatUniqueId}`);
        if (savedImages) {
            setGeneratedImages(JSON.parse(savedImages));
        }
    }, [chatUniqueId]);

    useEffect(() => {
        // Save images to localStorage when they change
        if (generatedImages.length > 0) {
            localStorage.setItem(`mindpaint_${chatUniqueId}`, JSON.stringify(generatedImages));
        }
    }, [generatedImages, chatUniqueId]);

    useEffect(() => {
        if (isThinking) {
            thinkingTimerRef.current = setInterval(() => {
                setThinkingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (thinkingTimerRef.current) {
                clearInterval(thinkingTimerRef.current);
            }
            setThinkingTime(0);
        }

        return () => {
            if (thinkingTimerRef.current) {
                clearInterval(thinkingTimerRef.current);
            }
        };
    }, [isThinking]);

    const editor = useEditor({
        extensions,
        content: initialResponse,
    });

    const handleSelectNode = useCallback(() => {
        if (!editor) return;
        const { state } = editor;
        const { from, to } = state.selection;
        const selectedNode = state.doc.textBetween(from, to, " ");
        setSelectedNode(selectedNode);
    }, [editor]);

    const handlePrompt = useCallback(
        async (promptType: keyof typeof PROMPT_TYPES | "Custom") => {
            if (!editor) return;

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
                setModificationTime(null);
                const startTime = performance.now();

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                const endTime = performance.now();
                const duration = Math.round(endTime - startTime);
                setModificationTime(duration);

                if (!text) throw new Error("Error while generating prompt");

                setInitialResponse(text);
                editor.commands.setContent(text);

                updateResponse({ chatUniqueId, updatedResponse: text })
                    .then(() => {})
                    .catch((error) => {
                        console.error("Error updating database:", error);
                    });

                setDropdown(false);
            } catch (error) {
                console.error("Error generating response:", error);
                setInitialResponse("Error generating response.");
                editor.commands.setContent("Error generating response.");
            } finally {
                setUpdateLoader(false);
            }
        },
        [editor, initialResponse, selectedNode, chatUniqueId, model]
    );

    const generateImages = async (prompt: string) => {
        const imageUrls = [];
        for (let i = 0; i < 2; i++) {
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&model=flux`;
            imageUrls.push(imageUrl);
        }
        setGeneratedImages(imageUrls);
    };

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
                    style={{ width: '85%' }}
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

            {imgName && (
                <div className="w-full mt-3 overflow-hidden">
                    <div className="p-4 w-fit max-w-full bg-rtlLight dark:bg-rtlDark rounded-md flex items-start gap-2">
                        <FaRegFileAlt className="text-4xl" />
                        <p className="text-lg truncate"> {imgName}</p>
                    </div>
                </div>
            )}

            {/* Display generated images if available */}
            {generatedImages.length > 0 && (
                <div className="w-full flex justify-center gap-4 mt-4">
                    {generatedImages.map((url, index) => (
                        <div key={index} className="relative w-1/2">
                            <img
                                src={url}
                                alt={`Generated Image ${index + 1}`}
                                className="w-full h-48 object-cover rounded-2xl"
                            />
                        </div>
                    ))}
                </div>
            )}

            {isThinking && thinkingText && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            MindThink Analysis
                        </h3>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {thinkingTime}s
                        </span>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                        {thinkingText}
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

            {modificationTime !== null && (
                <div className="w-full flex justify-end items-center mt-1 pr-1 gap-1">
                    <FiClock className="text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 border border-blue-500 rounded-lg px-2 py-1">
                        Response generated in: {modificationTime} ms
                    </span>
                </div>
            )}

            <ChatActionsBtns
                chatID={chatUniqueId}
                userPrompt={userPrompt}
                llmResponse={initialResponse}
                shareMsg={`user prompt: ${userPrompt} \n\n MindBot response:${handleTxtToSpeech()}`}
            />

            {dropdown && createPortal(<DropdownContent />, document.body)}
        </>
    );
};

export default ChatProvider;