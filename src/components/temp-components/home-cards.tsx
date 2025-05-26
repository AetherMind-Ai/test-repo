'use client'
import MindBotZustand from '@/utils/mindbot-zustand'
import React, { useMemo } from 'react'
import { LuGlobe } from "react-icons/lu";  // Lucide Icons
import { AiOutlineEye } from "react-icons/ai"; // For Vision
import { FaRegLightbulb } from "react-icons/fa";
import { AiFillSound } from "react-icons/ai";

const promptArray = [
  {
    icon: AiOutlineEye, // Using AiOutlineEye for MindVision-Flash
    title: "MindVision-Flash",
    subtitle: "-------------------------",
    prompt: "Summarize this video, image, pdf and highlight the key events.",
  },
  {
    icon: AiFillSound, // Using FaPaintBrush for MindAudio
    title: "MindAudio-Pro",
    subtitle: "-------------------------",
    prompt: "Analyze, process, and summarize audio files with MindAudio-Pro.",
  },
  {
    icon: LuGlobe, // Using LuGlobe for MindSearch-2.0
    title: "MindSearch-2.0",
    subtitle: "-------------------------",
    prompt: "Find the top 10 hotels in Egypt online, including the cost per night.",
  },
  {
    icon: FaRegLightbulb, // Using FaRobot for MindThink
    title: "MindThink-A2",
    subtitle: "-------------------------",
    prompt: "MindBot-1.5-Pro thinks longer and deeper for better answers to big questions.",
  }
];

const HomeCards = () => {
  const { setCurrChat } = MindBotZustand();
  
  const randomPrompts = useMemo(() => {
    const shuffled = [...promptArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, []);

  return (
    <div className="w-full h-auto grid md:grid-cols-4 grid-cols-1 overflow-hidden gap-2 mt-5 md:mt-16">
      {randomPrompts.map((item, index) => (
        <div
          key={index}
          onClick={() => setCurrChat('userPrompt', item.prompt)}
          className="dark:bg-rtlDark md:aspect-square bg-rtlLight hover:!bg-accentGray/20 cursor-pointer rounded-xl relative p-4 font-light"
        >
          <p className="font-bold">{item.title}</p> {/* Title */}
          
          {/* Conditionally render the subtitle if it exists */}
          {item.subtitle && <p className="italic text-sm text-gray-500">{item.subtitle}</p>}

          <p>{item.prompt}</p> {/* Description */}
          
          {/* Apply blue color to the icons */}
          <item.icon className="absolute text-4xl bottom-2 right-2 rounded-full p-2 aspect-square bg-white dark:bg-black text-blue-400" />
        </div>
      ))}
    </div>
  );
}

export default HomeCards;
