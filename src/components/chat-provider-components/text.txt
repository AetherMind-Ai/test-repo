"use client";
import React, { useState, useCallback } from "react";
import { BiDislike, BiLike } from "react-icons/bi";
import DevButton from "../dev-components/dev-button";
import ReactTooltip from "../dev-components/react-tooltip";
import ModifyResponse from "./modify-response";
import ShareChat from "./share-chat";
import { FiMoreVertical } from "react-icons/fi";
import DevPopover from "../dev-components/dev-popover";
import { Toaster, toast } from 'sonner'
import { MdContentCopy, MdOutlineFlag } from "react-icons/md";
import MindBotZustand from "@/utils/mindbot-zustand";
import { FcGoogle } from "react-icons/fc";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Link from "next/link";
import { IoMdSearch } from "react-icons/io";

const mindbot13 = "gemini-1.5-flash";

const ChatActionsBtns = ({
    chatID,
    llmResponse,
    userPrompt,
    shareMsg,
}: {
    chatID: string;
    llmResponse: string;
    userPrompt: string;
    shareMsg: string;
}) => {
    const { devToast, setToast } = MindBotZustand();
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: mindbot13 });
    const [googleRes, setGoogleRes] = useState<string[] | null>(null);
    const [loader, setLoader] = useState(false);
    const [showSearchQueries, setShowSearchQueries] = useState(false);
    const [liked, setLiked] = useState<"like" | "dislike" | null>(null); // null means no action

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareMsg);
            setToast('Copied to clipboard')
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

     const handleDoubleCheck = useCallback(async () => {
        const prompt = `
      Generate a list of at least 5 different Google search queries based strictly on the user prompt. Provide the queries in an array format without any unnecessary responses. Ensure the queries are relevant and varied but aligned with the user's prompt.
      Previous chats:
      Current User Query:
      ${userPrompt}`;
        try {
            setLoader(true);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            console.log("MindBot API Response Text:", text)

          if (typeof text === 'string') {
              text = text.trim()
              if (text.startsWith("```json")) {
                  text = text.substring(7).trim();
              }
              if (text.startsWith("```")) {
                text = text.substring(3).trim();
              }
              if (text.endsWith("```")) {
                  text = text.slice(0, -3).trim();
              }


            try {
                  const googleResArray = JSON.parse(text);
                  if (Array.isArray(googleResArray)) {
                    setGoogleRes(googleResArray);
                    setShowSearchQueries(true); // Set state to show search queries
                } else {
                    setToast("Failed to parse search queries. Please try again.");
                    console.error("Google response is not an array:", googleResArray);
                    setGoogleRes([]);
                   setShowSearchQueries(false);
                }
             } catch (jsonError) {
              console.error("Failed to parse Google search queries:", jsonError, text);
               setToast("Failed to parse search queries. Please try again.");
                setGoogleRes([]);
                setShowSearchQueries(false);
            }
          }
           else{
              setToast("Failed to parse search queries. Please try again. Response is not text.");
              setGoogleRes([]);
                setShowSearchQueries(false);
           }
        } catch (error) {
            console.error("Error generating search queries:", error);
            setToast("Failed to generate search queries. Please try again.");
              setShowSearchQueries(false);
        } finally {
            setLoader(false);
        }
    },[model,userPrompt,setToast]);

    const handleLikeClick = () => {
        setLiked(prev => prev === "like" ? null : "like");
    };

    const handleDislikeClick = () => {
          setLiked(prev => prev === "dislike" ? null : "dislike");
    };

    return (
        <>
            <div className="w-full flex items-center gap-2 !text-2xl mt-2">
                {[
                    { icon: BiLike, tipdata: "Good job", type: "like" },
                    { icon: BiDislike, tipdata: "Bad job", type: "dislike" },
                ].map((item, index) => (
                    <ReactTooltip key={index} tipData={item.tipdata}>
                        <DevButton
                           asIcon
                            rounded="full"
                            size="lg"
                            variant="v2"
                            onClick={item.type === "like" ? handleLikeClick : handleDislikeClick}
                             className={`opacity-80 ${liked === item.type ? '!bg-accentGray' : ''} ${liked === "like" && item.type === "like" ? '!text-accentBlue' : ''} ${liked === "dislike" && item.type === "dislike" ? '!text-red-400' : ''}`}
                        >
                            <item.icon  className={`${liked === item.type ? 'text-xl' : 'text-xl text-gray-400'}`} />
                        </DevButton>
                    </ReactTooltip>
                ))}
                <ModifyResponse chatUniqueId={chatID} llmResponse={llmResponse} />
                <ShareChat shareMsg={shareMsg} />
                <ReactTooltip tipData="Google It">
                    <DevButton
                        asIcon
                        rounded="full"
                        onClick={handleDoubleCheck}
                        size="lg"
                        variant="v2"
                        className="opacity-80"
                    >
                        {loader ? <span className="modal-loader"></span> : <FcGoogle />}
                    </DevButton>
                </ReactTooltip>
                <DevPopover
                    place="top-start"
                    popButton={
                        <ReactTooltip tipData="more">
                            <DevButton
                                asIcon
                                rounded="full"
                                size="lg"
                                variant="v2"
                                className="opacity-80"
                            >
                                <FiMoreVertical />
                            </DevButton>
                        </ReactTooltip>
                    }
                >
                    <div className="w-52 py-2">
                        <DevButton
                            onClick={copyToClipboard}
                            variant="v3"
                            className="w-full !justify-start gap-3 group"
                            rounded="none"
                        >
                            <MdContentCopy className="text-xl" />
                            Copy
                        </DevButton>
                        <DevButton
                            variant="v3"
                            className="w-full !justify-start gap-3 group"
                            rounded="none"
                        >
                            <MdOutlineFlag className="text-xl" />
                            Report legal issue
                        </DevButton>
                    </div>
                </DevPopover>
            </div>

      {showSearchQueries && googleRes && googleRes.length > 0 && (
          <div className="w-full md:w-[90%] mt-5 mx-auto overflow-hidden p-5 rounded-2xl space-y-3 bg-accentGray/10">
            <h3>Search related topics</h3>
              <div className="space-y-1">
                  {googleRes.map((item, index) => (
                      <DevButton
                          key={index}
                          target="_blank"
                          variant="v2"
                          href={`https://www.google.com/search?q=${encodeURIComponent(item)}`}
                          className="text-accentBlue/80 w-full !justify-start text-left flex items-center gap-2 hover:!bg-accentBlue/15"
                      >
                          <IoMdSearch className="text-xl" />
                          <p className="truncate">{item}</p>
                      </DevButton>
                  ))}
              </div>
          </div>
      )}
        </>
    );
};

export default ChatActionsBtns;
 
