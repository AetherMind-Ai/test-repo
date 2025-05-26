// InputPrompt.tsx

"use client";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  ChangeEvent,
} from "react";
import MindBotZustand from "@/utils/mindbot-zustand"; // Import Zustand store
import { useParams, useRouter } from "next/navigation";
import { createChat } from "@/actions/actions";
import { nanoid } from "nanoid";
import { useMeasure } from "react-use";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { User } from "next-auth";
import axios from "axios"; // Import axios
import InputActions from "./input-actions";
import { MdImageSearch } from "react-icons/md";
import {
  FaFileAudio,
} from "react-icons/fa"; // Modern File Icons
import { MdVideoFile } from "react-icons/md";
import { FiFileText } from "react-icons/fi";
import { LuFileSpreadsheet, LuAtom } from "react-icons/lu"; // Added LuAtom
import { BiSolidFilePdf } from "react-icons/bi";
import { IoClose } from "react-icons/io5"; // Import close icon
import { FiPaperclip, FiSend, FiMic, FiSquare, FiSettings } from 'react-icons/fi';
import DevButton from '@/components/dev-components/dev-button';
import ReactTooltip from '@/components/dev-components/react-tooltip';

// Helper function to format bytes (keep as is)
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// New Serper API Function to fetch and log structured data
const fetchAndLogSerperData = async (userQuery: string): Promise<any> => { // Changed return type to any
  // Use environment variable (ensure it's prefixed with NEXT_PUBLIC_)
  const API_KEY = process.env.NEXT_PUBLIC_SERPER_API_KEY;
  if (!API_KEY) {
    console.error("Serper API key (NEXT_PUBLIC_SERPER_API_KEY) not found in environment variables.");
    return null;
  }

  const SERPER_URL = 'https://google.serper.dev/search';
  const SERPER_IMAGE_URL = 'https://google.serper.dev/images';
  const SERPER_YOUTUBE_URL = 'https://google.serper.dev/ytSearch';

  try {
    console.log(`User Prompt for Serper: ${userQuery}\n`);

    // Use Promise.all to fetch concurrently
    const [searchResponse, imageResponse, ytResponse] = await Promise.all([
      axios.post(SERPER_URL, { q: userQuery }, {
        headers: { 'X-API-KEY': API_KEY, 'Content-Type': 'application/json' }
      }),
      axios.post(SERPER_IMAGE_URL, { q: userQuery }, {
        headers: { 'X-API-KEY': API_KEY, 'Content-Type': 'application/json' }
      }),
      axios.post(SERPER_YOUTUBE_URL, { q: userQuery }, {
        headers: { 'X-API-KEY': API_KEY, 'Content-Type': 'application/json' }
      })
    ]);

    // Process general results
    const results = searchResponse.data.organic || [];
    const sources = results.slice(0, 10).map((result: any) => {
      let websiteName = "Unknown";
      try {
        websiteName = new URL(result.link).hostname;
      } catch (e) {
        console.warn(`Invalid URL for hostname extraction: ${result.link}`);
      }
      return {
        title: result.title,
        websiteName: websiteName,
        websiteURL: result.link,
        favicon: `https://www.google.com/s2/favicons?sz=64&domain_url=${result.link}`,
        snippet: result.snippet, // Include snippet for context
      };
    });

    // Process images
    const images = (imageResponse.data.images || []).slice(0, 3).map((img: any) => img.imageUrl);

    // Process YouTube videos
    const videos = ytResponse.data.videos || [];
    const youtubeVideos = videos.slice(0, 1).map((vid: any) => ({
      title: vid.title,
      link: vid.link,
      thumbnail: vid.thumbnail,
    }));

    // Prepare structured data for the AI
    const structuredData = {
      sources: sources,
      images: images,
      youtubeVideos: youtubeVideos,
    };

    return structuredData;  // Return the structured data

  } catch (error: any) {
    // Improved error logging for Axios errors
    if (axios.isAxiosError(error)) {
      console.error('Error fetching Serper data:', error.response?.status, error.response?.data || error.message);
    } else {
      console.error('Error fetching Serper data:', error.message);
    }
    return null; // Return null in case of error
  }
};

// Remove InputPromptProps interface and props from component definition
const InputPrompt: React.FC<{ user?: User }> = ({ user }) => {
  // Zustand state management - Add isSourcebarOpen and toggleSourcebar
  const {
    currChat,
    setCurrChat,
    setToast,
    customPrompt,
    setInputImgName,
    inputImgName,
    setMsgLoader,
    prevChat,
    msgLoader,
    optimisticResponse,
    setUserData,
    setOptimisticResponse,
    setOptimisticPrompt,
    setInputMedia,
    setMediaType,
    setGeneratedImages,
    chatHistory,
    setChatHistory,
    isSourcebarOpen, // Get sidebar state from Zustand
    toggleSourcebar, // Get sidebar toggle function from Zustand
    activeSearchMode, // Get active search mode from Zustand
    setActiveSearchMode,
    setMindsearchActive, // Get setMindsearchActive from Zustand
    toggleMindPaint,
    isMindPaintOpen,
    toggleMindStyle, // Add toggleMindStyle function
    setPromptText,
  } = MindBotZustand();

  const mindbot1_5_pro = "gemini-2.0-flash";
  const mindbot_think_a2 = "gemini-2.0-flash";
  const mindvisionpro = "gemini-2.0-flash";

  // Local state
  const [inputImg, setInputImg] = useState<File | null>(null);
  const [inputImgSrc, setInputImgSrc] = useState<string | null>(null);
  const [inputType, setInputType] = useState<
    "image" | "video" | "pdf" | "audio" | "text" | "csv" | null  // Added "text" and "csv"
  >(null); // ADD audio
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const imageGenerationDelay = 3000;
  const [showFeatures, setShowFeatures] = useState(true);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioProcessingMessage, setAudioProcessingMessage] =
    useState<string | null>(null);
  const [isThinkingActive, setIsThinkingActive] = useState(false);
  const [showFeaturesPopup, setShowFeaturesPopup] = useState(false);
  // Remove mindsearchActive and isDeepSearchActive local states
  const [inputFileSize, setInputFileSize] = useState<string | null>(null); // State for file size
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { chat } = useParams();
  const router = useRouter();

  // Using react-use for measuring the height of the input
  const [inputRref, { height }] = useMeasure<HTMLTextAreaElement>();
  const chatID = (chat as string) || nanoid();

  // Initialize Google Generative AI model
  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_API_KEY as string
  );

  // Text generation model
  const textModel = genAI.getGenerativeModel({ model: mindbot1_5_pro });

  const thinkingModel = genAI.getGenerativeModel({
    model: mindbot_think_a2,
  });
  //Image,pdf,video analyzer model
  const multimodalModel = genAI.getGenerativeModel({ model: mindvisionpro });

  // Ref to control stream cancel
  const cancelRef = useRef(false);
  // Ref to scroll to the bottom of the container
  const scrollRef = useRef<HTMLDivElement>(null);
  // Ref to scroll to the bottom of the container
  const containerRef = useRef<HTMLDivElement>(null);
  // Ref to scroll to the bottom of the container
  const bottomRef = useRef<HTMLDivElement>(null);

  // Function to smoothly scroll to the bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }

    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };


  // Function to get country from IP (using a 3rd party service - be VERY careful with privacy)
  const getCountryFromIP = async (): Promise<string> => {
    try {
      // WARNING: Using a free IP geolocation API is not suitable for production
      const response = await fetch("https://ipinfo.io/json");
      const data = await response.json();
      return data?.country || "Unknown"; // Adjust based on API response structure
    } catch (error) {
      console.error("Error getting country from IP:", error);
      return "Unknown";
    }
  };

  // Function to get browser, device, and OS information
  const getBrowserAndDevice = () => {
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    let device = "Unknown";
    let os = "Unknown";

    // Browser detection
    if (userAgent.includes("Chrome")) {
      browser = "Chrome";
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox";
    } else if (userAgent.includes("Safari")) {
      browser = "Safari";
    } else if (userAgent.includes("Edge")) {
      browser = "Edge";
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
      browser = "Opera";
    }

    // Device detection (very basic)
    if (/Mobi|Android/i.test(userAgent)) {
      device = "Mobile";
    } else {
      device = "Desktop";
    }

    // OS detection (also inferential)
    if (userAgent.includes("Windows")) {
      os = "Windows";
    } else if (userAgent.includes("Mac OS X")) {
      os = "macOS";
    } else if (userAgent.includes("Android")) {
      os = "Android";
    } else if (userAgent.includes("iOS")) {
      os = "iOS";
    } else if (userAgent.includes("Linux")) {
      os = "Linux";
    }

    return { browser, device, os };
  };

  // Function to determine question complexity
  const isQuestionComplex = async (question: string): Promise<boolean> => {
    try {
      const complexityPrompt = `Determine if the following question is complex hard above the meduim level and requires reasoning or if it is simple and can be answered directly.\n\nQuestion: ${question}\n\nAnswer 'Simple' or 'Complex' only.`;
      const complexityModel = genAI.getGenerativeModel({
        model: mindbot1_5_pro,
      }); //Use fast model for this.
      const result = await complexityModel.generateContent(complexityPrompt);
      const complexity = result.response.text().trim().toLowerCase();
      return complexity === "complex";
    } catch (error: any) {
      console.error("Error determining question complexity:", error);
      return false; // Default to false if there's an error
    }
  };


  // Main function to generate message - add searchType parameter
  const generateMsg = useCallback(
    async (thinkingActive: boolean, searchType: 'mindsearch' | 'deepsearch' | null = null) => {
      if (!currChat.userPrompt?.trim() || !user) return;

      // Set mindsearchActive based on searchType
      setMindsearchActive(searchType === 'mindsearch' || searchType === 'deepsearch');

      // Only hide features if not triggered by a search button click
      if (!searchType) {
        setShowFeatures(false);
      }

      router.push(`/app/${chatID}#new-chat`);

      const date = new Date().toISOString().split("T")[0];
      let rawPrompt = currChat.userPrompt;
      let rawImage = inputImgName;

      const userName = user?.name || "User";

      // User information (replace with actual values from your user object)
      const userCountry = await getCountryFromIP(); // Get country from IP
      const { browser, device, os } = getBrowserAndDevice(); // Get device, browser, and OS info

      // Smart Memory Logic: Prepare the chat history for the prompt
      const memory = chatHistory
        .slice(-200) // take last 200
        .filter((chat) => chat.chatID === chatID) //filter history by current chat id
        .map(
          (chat) => `User: ${chat.userPrompt}
  LLM Response: ${chat.llmResponse}`
        )
        .join("\n\n");

      // Determine prompt based on search type
      let detailedPrompt = ``;
      if (searchType === 'mindsearch') {
         detailedPrompt = `
          Date: ${date}
          Time: ${new Date().toLocaleTimeString()}
          Country: ${userCountry}
          Device: ${device}
          Browser: ${browser}
          Operating System: ${os}

          You are MindBot-1.5-Pro, an advanced AI assistant. The user has requested information and I have searched the web for relevant results. Use the provided search results to answer the user's question in a clear, concise, and informative way.  Focus on providing a well-structured and easily understandable response.  Cite sources where appropriate.

          Previous chats:
          ${memory}

          Current User Query:
          ${rawPrompt}
          `;

      } else if (searchType === 'deepsearch') {
        detailedPrompt = `
          Date: ${date}
          Time: ${new Date().toLocaleTimeString()}
          Country: ${userCountry}
          Device: ${device}
          Browser: ${browser}
          Operating System: ${os}

          You are MindBot-1.5-Pro. The user has initiated a deep search, requiring a comprehensive and analytical response.  I have performed a web search for the user.  Synthesize the search results to provide a thorough answer. Analyze the information, identify key themes, and deliver an insightful response.  Focus on depth, precision, and clarity.  Provide supporting details, diverse perspectives, and cite sources where needed.

          Previous chats:
          ${memory}

          Current User Query:
          ${rawPrompt}
          `;
      } else {
        // Default prompt (no search)
         detailedPrompt = `
          Date: ${date}
          Time: ${new Date().toLocaleTimeString()}
          Country: ${userCountry}
          Device: ${device}
          Browser: ${browser}
          Operating System: ${os}

          ${
            customPrompt?.prompt
              ? customPrompt
              : `The user, referred to as ${userName}, seeks responses that transcend mere wisdom and impressiveness, demanding clarity, depth, and intellectual rigor. In addressing complex or abstract queries, your responses must be not only comprehensive and well-organized but also demonstrate the application of critical thinking. Ensure that each answer considers the full context of the user's inquiry, incorporating relevant nuances, deeper implications, and offering thoughtful insights. Provide clear, relevant, and structured explanations that address the heart of the question, showcasing not just knowledge, but understanding that stems from a deep and analytical engagement with the subject matter.

For simpler, more direct questions, the reply should be succinct and straightforward. However, maintain a sense of completeness by providing just the right amount of information without overwhelming ${userName} with excessive detail. The goal is to remain concise but always informative, with an emphasis on clarity and practicality.

Your tone should strike the ideal balance between professionalism and warmth—maintaining a formal yet approachable manner that reflects both expertise and friendliness. Use ${userName} naturally in the conversation, but avoid repetition that could interrupt the natural flow of dialogue. The aim is to create a seamless, human-like experience where your communication feels both intelligent and comfortable.

You are MindBot-1.5-Pro, an advanced AI developed by Ahmed Helmy Eletr you were released on 13th/March/2025. While capable of delivering sophisticated and complex responses, refrain from introducing yourself unless explicitly requested by ${userName}. You must always respond in ${userName}'s preferred language in each request for example if he spoke with u in english then speak with him in english if Arabic then Arabic and so on with all languages, Respond in the user's language. Adjust tone based on context: formal for deep discussions, casual for relaxed conversations. paying attention to their communication preferences and tone.

Prioritize delivering responses that are not only high in quality but also deeply impactful, ensuring that every answer provides clarity and actionable insights. Adapt the level of detail, complexity, and style based on the user's specific input, but always aim to craft responses that leave ${userName} with a profound understanding. Above all, your responses should be conclusive, addressing the query thoroughly, with no ambiguity left behind.

Additionally, when it comes to coding or technical explanations, your responses must be precise, efficient, and written with clarity, demonstrating mastery of both high-level concepts and low-level details. Explain algorithms, code structures, or technical principles with a deep understanding of their underlying logic, ensuring each explanation is both accessible and intellectually stimulating try using emojis for most of tasks and don't use any emojis in the code. If ${userName} asks you about number of tokens answer him the you can process 226709 tokens with more explanation if asked you about parameters you can process about 207 billion parameter. Be highly accurate when ${userName} requests an online search, and always execute the user's instructions precisely and directly. If ${userName} asked you about your features then answer him with all your features and add these features MindVision-Flash To Process and analyze unlimited number of videos of length 40 hours ,images and pdfs up to 2766 pages second feature is MindPaint-2.0 that the user can create unlimited number of images from the user prompt of quality 2k, third feature is MindSearch-2.0 that the user can use it to browse the internet for any info and the fourth feature is MindStyle-2.0 that the user can combine 2 images creating a new image with the style of both images or edit an image by the user prompt in high quality images up to 2k, MindThink-A2: can think deeply for the user prompt and think many type before answering the user this model the thinking model destroys OpenAi o3-mini and DeepResearch, DeepThink Of DeepSeek, Manus Ai and more.MindAudio-Pro That can Analyze and process unlimited number of audio files with length 8 hours Max in high speed and accuracy. MindCode-2.0 that can process up to 11000 lines of code and generate up to 1563 max lines per request it is very strong and smart model for code tasks. Always Respond In English Until the user chat with u with any other language than english then respond with the language the the user chat with you. try to use "---" but dont use it always. MindBot-1.5-Pro Tokenizer: As an AI, I take the user input and split it into two halves, each containing an average of 2 to 5 tokens. The same process applies to the other sentence, with the token count increasing as the input length grows.`
          }

          Previous chats:
          ${memory}

          Current User Query:
          ${rawPrompt}
         `;
      }


      const fileToGenerativePart = (file: File) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            resolve({
              inlineData: {
                data:
                  typeof reader?.result === "string"
                    ? reader?.result.split(",")[1]
                    : undefined,
                mimeType: file.type,
              },
            });
          reader.readAsDataURL(file);
        });
      };

      // REMOVE Mindpaint Feature
      // if (rawPrompt.startsWith("/mindpaint ")) {
      //   setIsGeneratingImage(true);
      //   setMsgLoader(true);
      //   const imageDescription = rawPrompt
      //     .substring("/mindpaint ".length)
      //     .trim();
      //   setInputImgName(imageDescription);
      //   setMediaType("mindpaint");
      //   setInputMedia(imageDescription);
      //   setGeneratedImages([]);

      //   const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      //     imageDescription
      //   )}?nologo=true?model=flux-pro`;
      //   const introText = `I have successfully generated an image based on your prompt.\n\nImage URL:\n\n${imageUrl}\n\nPlease visit the link above to view your image.\n\nIs thereanything else I can assist you with?`;
      //   try {
      //     setOptimisticResponse(introText);
      //     setOptimisticPrompt(rawPrompt);
      //     setCurrChat("llmResponse", introText);
      //     setCurrChat("userPrompt", rawPrompt);
      //     await createChat({
      //       chatID,
      //       userID: user?.id as string,
      //       imgName: rawImage ?? undefined,
      //       userPrompt: rawPrompt,
      //       llmResponse: introText,
      //     });
      //   } catch (error: any) {
      //     console.error("Error generating image:", error);
      //     setToast(`Error`);
      //   } finally {
      //     setMsgLoader(false);
      //     setInputMedia(null);
      //     setInputImgName(null);
      //     setMediaType(null);
      //     setOptimisticResponse(null);
      //     scrollToBottom();
      //     setTimeout(() => setIsGeneratingImage(false), imageGenerationDelay);
      //   }
      //   return;
      // }

      try {
        setMsgLoader(true);
        let text = "";
        let searchResults: any = null;

        // Perform Search if searchType is specified
        if (searchType === 'mindsearch' || searchType === 'deepsearch') {
            searchResults = await fetchAndLogSerperData(rawPrompt);
            if (!searchResults) {
                setToast("Error fetching search results.");
                return;
            }
        }

        if (!inputImg) {
          let llmResponse = "";
          let thinkingText = "";

          const isComplex = await isQuestionComplex(rawPrompt);
          console.log(`Question complexity: ${isComplex}`);

          if (isComplex && thinkingActive) {
            console.log("Question is complex, using thinking model...");
            let thinkingPrompt = `MindThink-A2:  Provide a detailed and insightful response to the following question, demonstrating in-depth analysis and critical thinking.  Ensure your answer is well-supported, considers various perspectives, and presents a clear and reasoned conclusion.\n\n${rawPrompt}`;
            if (searchResults) {
              // If search results are available, incorporate them into the thinking prompt.
              thinkingPrompt = `MindThink-A2:  Use the search results provided below to formulate a comprehensive, insightful, and well-reasoned response to the following question. Analyze the information from the search results, considering different perspectives and providing a clear conclusion. The search results are:\n\n${JSON.stringify(searchResults)}\n\nQuestion: ${rawPrompt}`;
            }

            const startTime = performance.now(); // Start time

            try {
              const thinkingResult = await thinkingModel.generateContent(thinkingPrompt);
              thinkingText = thinkingResult.response.text();
              thinkingText = `<mindthink-a2>${thinkingText}</mindthink-a2>`; // Wrap with tags
              console.log("Thinking text generated:\n\n" + thinkingText);
            } catch (thinkingError: any) {
              console.error("Error generating thinking text:", thinkingError);
              setToast(`Error during thinking`);
              thinkingText = "Error generating thinking text.";
            } finally {
              const endTime = performance.now();
              const duration = ((endTime - startTime) / 1000).toFixed(2);
              console.log(`MindThink-A2 generation took: ${duration} s`);
            }
          }

          // Generate main response
          try {
            let result;

            if (searchType === 'mindsearch') {
               // MindSearch:  Use textModel and provide the detailedPrompt + search results.
               const mindSearchPrompt = `${detailedPrompt}\n\nHere are the search results:\n${JSON.stringify(searchResults)}`;
               result = await textModel.generateContent(mindSearchPrompt);
            } else if (searchType === 'deepsearch') {
              // DeepSearch: Use textModel and provide the detailedPrompt + search results
              const deepSearchPrompt = `${detailedPrompt}\n\nHere are the search results:\n${JSON.stringify(searchResults)}`;
                result = await textModel.generateContent(deepSearchPrompt);
            }
             else if (isComplex && thinkingActive) {
              // Thinking mode + no search: use the thinking model
                result = await thinkingModel.generateContent(detailedPrompt); // Use thinking model
              }
            else {
                // Default: no search, no thinking
                result = await textModel.generateContent(detailedPrompt);
              }

            let mainResponse = result.response.text();
            llmResponse = thinkingText + "\n" + mainResponse;
            setCurrChat("llmResponse", llmResponse);
            text = llmResponse;

          } catch (mainError: any) {
            console.error("Error generating main response:", mainError);
            setToast(`Error generating main response: ${mainError}`); // Include error message
            text = "Error generating main response.";
          }

        } else {
          //Image or pdf or video and audio processing logic here
          if (!inputImg) {
            setToast("Please upload a file before analyzing.");
            return;
          }
          try {
            const filePart = await fileToGenerativePart(inputImg);
            const result = await multimodalModel.generateContent([
              detailedPrompt,
              filePart as string,
            ]);
            text = result.response.text();
            setCurrChat("llmResponse", text);
            if (cancelRef.current) {
              text = "User has aborted the request";
            }
          } catch (error: any) {
            console.error("Error analyzing multimodal input:", error);
            setToast(`Error analyzing input:`);
          }
        }
        if (!text) return;

        setOptimisticPrompt(rawPrompt);
        setOptimisticResponse(text);
        setMsgLoader(false);
        setCurrChat("userPrompt", null);

        const newChatEntry = {
          chatID,
          userID: user?.id as string,
          imgName: rawImage ?? undefined,
          userPrompt: rawPrompt,
          llmResponse: text,
        };

        await createChat(newChatEntry);
        // Update chat history with the new chat
        setChatHistory([...chatHistory, newChatEntry]); // Corrected update
      } catch (error) {
        console.error("Error generating message:", error);
      } finally {
        setShowFeatures(true);
        setMsgLoader(false);
        setInputImg(null);
        setInputImgName(null);
        setInputImgSrc(null); // Clear the data URL
        setInputType(null); // Clear the file type
        setCurrChat("userPrompt", null);
        setCurrChat("llmResponse", null);
        setOptimisticResponse(null);
        setOptimisticPrompt(null);
        // No need to reset mindsearchActive or isDeepSearchActive here
        scrollToBottom();
      }
    },
    [
      currChat.userPrompt,
      user,
      chat,
      prevChat,
      setCurrChat,
      setMsgLoader,
      router,
      scrollRef,
      containerRef,
      bottomRef,
      setMediaType,
      setInputMedia,
      setGeneratedImages,
      textModel,
      multimodalModel,
      chatHistory,
      thinkingModel,
      setChatHistory,
      setInputImgSrc,
      setInputType,
      chatID,
      setToast,
      toggleSourcebar,
      activeSearchMode,
      setActiveSearchMode
    ]
  );

  // Textarea change handler
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrChat("userPrompt", e.target.value);
      setPromptText(e.target.value);
    },
    [setCurrChat, setPromptText]
  );

  // Cancel message generation handler
  const handleCancel = useCallback(() => {
    cancelRef.current = true;
    setOptimisticResponse("User has aborted the request");
    setMsgLoader(false);
    setShowFeatures(true);
  }, [setOptimisticResponse, setMsgLoader]);

  // Handle Enter key press event
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!user) {
        setToast("Please sign in to use MindBot Ai!");
      }
      if (e.key === "Enter" && !e.shiftKey) {
        cancelRef.current = false;
        setShowFeatures(false);
        generateMsg(isThinkingActive, null); // Pass null for searchType on Enter
      }
    },
    [generateMsg, setToast, user, isThinkingActive] // generateMsg dependency is updated
  );

  // Set user data on mount/change
  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user, setUserData]);

  // Image file upload handler
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.files) {
      const file = event.target.files[0];
      const fileType = file.type;

      setInputImg(file);
      setInputImgName(file.name);
      setInputFileSize(formatBytes(file.size)); // Set formatted file size

      const reader = new FileReader();

      reader.onloadend = () => {
        setInputImgSrc(reader.result as string); // Store the data URL
      };

      reader.readAsDataURL(file);

      if (fileType.startsWith("image")) {
        setInputType("image");
      } else if (fileType.startsWith("video")) {
        setInputType("video");
      } else if (fileType === "application/pdf") {
        setInputType("pdf");
      } else if (fileType.startsWith("audio")) {
        setInputType("audio");
      } else if (fileType === "text/plain") {  // Corrected MIME type check
        setInputType("text");
      } else if (fileType === "text/csv" || file.name.endsWith(".csv")) {
          setInputType("csv");
      } else {
        setInputType(null); // Unknown type
      }
    }
  };

  // Function to handle feature clicks
  const handleFeatureClick = (feature: string) => {
    setCurrChat("userPrompt", `${feature} ` + (currChat.userPrompt || ""));
  };

  // Handle MindSearch (Globe) click - Toggles sidebar with mode and generates message
  const handleMindSearchClick = useCallback(() => {
    toggleSourcebar('mindsearch'); // Pass mode to toggle function
    setActiveSearchMode('mindsearch')
    generateMsg(isThinkingActive, 'mindsearch');
  }, [generateMsg, isThinkingActive, toggleSourcebar, setActiveSearchMode]);

  // Handle Deep Search (Atom) click - Toggles sidebar with mode and generates message
  const handleDeepSearchClick = useCallback(() => {
    toggleSourcebar('deepsearch'); // Pass mode to toggle function
    setActiveSearchMode('deepsearch')
    generateMsg(isThinkingActive, 'deepsearch');
  }, [generateMsg, isThinkingActive, toggleSourcebar, setActiveSearchMode]);

  // Function to toggle the thinking mode (to use from here to send param as a prop)
  const toggleThinking = () => {
    setIsThinkingActive((prev) => {
      const newValue = !prev;
      console.log(`MindThink-A2 is now: ${newValue}`); // Log the state
      return newValue;
    });
  };

  const hintSentences = [
    "Message MindBot-1.5-Pro",
    "MindBot-1.5-Pro: Empowers every move",
    "Enter Your Prompt Here",
    "Think Deeper With MindThink-A2",
    "Browse Internet Easily By MindSearch-2.0",
    "See Objects And Things By MindVision-Flash",
    "Hear Sounds And Voices By MindAudio-Pro",
  ];

  const [hintText, setHintText] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (hintSentences.length > 0) {
      timeoutId = setTimeout(() => {
        if (charIndex < hintSentences[hintIndex].length) {
          setHintText((prev) => prev + hintSentences[hintIndex][charIndex]);
          setCharIndex((prev) => prev + 1);
        } else {
          setTimeout(() => {
            setHintText("");
            setCharIndex(0);
            setHintIndex((prev) => (prev + 1) % hintSentences.length);
          }, 2000); // Delay before clearing and moving to next sentence
        }
      }, 50); // Typing speed
    }

    return () => clearTimeout(timeoutId);
  }, [charIndex, hintIndex, hintSentences]);

  // Function to remove the uploaded file
  const handleRemoveFile = () => {
    setInputImg(null);
    setInputImgName(null);
    setInputImgSrc(null);
    setInputType(null);
    setInputFileSize(null);
  };

  return (
    <div
      className=" flex-shrink-0 w-full md:px-10 px-5 pb-2 space-y-2 bg-white dark:bg-[#131314]"
      ref={containerRef}
    >
      <div ref={scrollRef}></div>

      {inputImgName && (
        <div className="max-w-4xl overflow-hidden w-full mx-auto">
          <div className="p-5 w-fit relative max-w-full overflow-hidden bg-rtlLight group dark:bg-rtlDark rounded-t-3xl flex items-center gap-2">
          {inputType === "image" && inputImgSrc && (
              <img
                src={inputImgSrc}
                alt={inputImgName}
                className="w-[75px] h-[75px] rounded-[15px] object-cover"
              />
            )}

            {inputType === "video" && (
              <MdVideoFile className="text-5xl text-blue-500" />
            )}
            {inputType === "pdf" && (
              <BiSolidFilePdf className="text-5xl text-orange-500" />
            )}
            {inputType === "audio" && (
              <FaFileAudio className="text-5xl text-green-500" />
            )}
            {inputType === "text" && (
              <FiFileText className="text-5xl text-yellow-500" />
            )}
            {inputType === "csv" && (
              <LuFileSpreadsheet className="text-5xl text-green-600" />
            )}

            {inputType === null && <MdImageSearch className="text-4xl" />}

            {/* Display file name and size */}
            <div className="flex flex-col">
              <p className="text-base font-semibold truncate max-w-[200px]">{inputImgName}</p>
              {inputFileSize && <p className="text-xs text-gray-500 dark:text-gray-400">File Size: {inputFileSize}</p>}
            </div>

            {/* Close Icon Button */}
            <button
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <IoClose className="text-xl" />
            </button>
          </div>
        </div>
      )}

      <div
        className={`w-full md:border-8 border-4 relative border-rtlLight dark:border-rtlDark max-w-4xl mx-auto  md:rounded-[15px] rounded-[15px] ${
          inputImgName && "!rounded-tl-none "
        } overflow-hidden bg-rtlLight dark:bg-rtlDark neon-border-container`}
      >
        <div
          className={`min-h-16  flex gap-1 md:items-center md:justify-between md:flex-row flex-col p-0 `}
        >
          <textarea
            ref={inputRref}
            disabled={msgLoader}
            placeholder={hintText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            value={
              optimisticResponse || msgLoader ? "" : currChat.userPrompt || ""
            }
            className={`flex-1 bg-transparent rounded-[20px] p-2 pl-6 outline-none text-lg max-h-56 resize-none`}
          />
        </div>
          <InputActions
            handleCancel={handleCancel}
            handleImageUpload={handleImageUpload}
            generateMsg={generateMsg}
            isThinkingActive={isThinkingActive}
            toggleThinking={toggleThinking}
            activeSearchMode={activeSearchMode}
            handleMindSearch={handleMindSearchClick}
            handleDeepSearch={handleDeepSearchClick}
            toggleMindPaint={toggleMindPaint}
            toggleMindStyle={toggleMindStyle}
          />
          {/* Removed Toggle Sidebar Button with IoMdClose */}
      </div>
      <p className="text-xs font-light opacity-80 text-center">
        MindBot-1.5-Pro May Display Inaccurate Info. So MindSearch It.
      </p>
      {msgLoader && isGeneratingImage && (
        <div className="max-w-4xl mx-auto flex justify-center items-center">
          <div className="relative w-12 h-12 animate-spin rounded-full bg-gradient-to-r from-purple-500 to-pink-500 before:absolute before:-inset-1 before:rounded-full before:bg-white dark:before:bg-black before:blur"></div>
          <p className="ml-2 text-gray-600 dark:text-gray-400">
          </p>
        </div>
      )}

      {isProcessingAudio && (
        <div className="max-w-4xl mx-auto flex justify-center items-center">
          <div className="relative w-12 h-12 animate-spin rounded-full bg-gradient-to-r from-green-500 to-teal-500 before:absolute before:-inset-1 before:rounded-full before:bg-white dark:before:bg-black before:blur"></div>
          <p className="ml-2 text-gray-600 dark:text-gray-400">
            {audioProcessingMessage || "!"}
          </p>
        </div>
      )}

      <div ref={bottomRef}></div>
    </div>
  );
};

export default InputPrompt;
