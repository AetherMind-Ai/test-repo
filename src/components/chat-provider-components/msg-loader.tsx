"use client";
import MindBotZustand from "@/utils/mindbot-zustand";
import { FormatOutput } from "@/utils/shadow";
import Image from "next/image";
import React, { useEffect } from "react";
import Markdown from "react-markdown";
import root from "react-shadow/styled-components";
import GradientLoader from "./gradient-loader";
import { FaRegFileAlt } from "react-icons/fa";


const MsgLoader = ({
  name,
  image,
}: {
  name: string;
  image: string;
}) => {
  const { currChat, msgLoader, inputImgName } = MindBotZustand();
    const [isBumping, setIsBumping] = React.useState(true);

   useEffect(() => {
     if (currChat.llmResponse) {
          setIsBumping(false);
     } else{
        setIsBumping(true)
    }

   }, [currChat.llmResponse]);

  return (
    msgLoader && (
      <div key="loader" className="my-16 mt-10 fade-in-element">
        <div className="w-full h-fit flex items-start gap-3">
          <Image
            src={image}
            alt={name}
            width={35}
            height={35}
            className="rounded-full cursor-pointer"
          />
          <textarea
            className="prompt-area pt-1 max-h-40  text-base resize-none bg-transparent outline-none rounded-md px-1 w-full"
            readOnly
            value={currChat.userPrompt}
          />
        </div>
        {inputImgName &&
          <div className="w-full mt-3 overflow-hidden">
            <div className="p-4 max-w-full w-fit bg-rtlLight dark:bg-rtlDark rounded-md flex items-start gap-2">
             <FaRegFileAlt className="text-4xl" /> {/* Updated to MdDescription */}
              <p className="text-lg  truncate"> {inputImgName}</p>
            </div>
          </div>
        }
        <div className="w-full flex justify-end h-16 items-center">
        </div>
        <div id="new-chat" className="flex md:flex-row flex-col w-full items-start gap-4">
           <Image
              src="favicon.ico"
              alt="MindBot Logo"
              width={40}
              height={40}
               className={`transition-transform duration-300 ${isBumping ? 'animate-bump' : ''}`}
            />
          {!currChat.llmResponse ? (
            <GradientLoader />
          ) : (
            <root.div className="w-full shadowDiv -translate-y-4">
              <FormatOutput>
                <Markdown>{currChat.llmResponse}</Markdown>
              </FormatOutput>
            </root.div>
          )}
        </div>
      </div>
    )
  );
};

export default MsgLoader;
