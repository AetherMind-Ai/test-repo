'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuSearch } from "react-icons/lu";
import Image from 'next/image';

interface Tool {
    name: string;
    description: string;
    image: string;
    creator: string;
}

interface CategoryData {
    "Top Picks": Tool[];
    Mathematics: Tool[];
    Writing: Tool[];
    Medicine: Tool[];
    [key: string]: Tool[];
}

const Page = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("Top Picks");

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  const categoryData: CategoryData = {
    "Top Picks": [
      {
        name: "Maktabty Ai Assistant",
        description: "Chat with books on the platform effortlessly.",
        image: "https://i.ibb.co/zKQYTWM/mktabty.png",
        creator: "Nabd Elsout"
      },
      {
        name: "Exam Ai Corrector",
        description: "Instantly correct answers and refine writing with AI.",
        image: "https://i.ibb.co/3YzmrV3h/amasch.jpg",
        creator: "AMA Lang School"
      },
      {
        name: "Fathalla Ai Call Center",
        description: "Analyze calls and rate them with AI.",
        image: "https://i.ibb.co/Ld0CNq9W/download.png",
        creator: "Fathalla Shopping"
      },
      {
        name: "Science Tutor",
        description: "Your personal AI science tutor.",
        image: "https://i.ibb.co/DDhf85QY/sciencefufn.png",
        creator: "ScienceIsFun"
      }
    ],
    "Mathematics": [
      {
        name: "Math Solver Pro",
        description: "Solve complex equations with ease.",
        image: "https://i.ibb.co/j9MPwKJQ/gemotry2.png",
        creator: "MathGenius Inc."
      },
      {
        name: "Geometry Guide",
        description: "Understand geometric principles.",
        image: "https://i.ibb.co/Xrfbg8hs/geometry1.png",
        creator: "GeoLearn"
      },
      {
        name: "Calculus Companion",
        description: "Master calculus concepts.",
        image: "https://i.ibb.co/XxpLxv9s/calc.webp",
        creator: "CalcMasters"
      },
      {
        name: "Statistics Wiz",
        description: "Analyze data and generate statistics.",
        image: "https://i.ibb.co/8DRVg1X0/statics.jpg",
        creator: "StatPro"
      }
    ],
    "Writing": [
      {
        name: "Creative Writer's Aid",
        description: "Inspiration for creative writing.",
        image: "https://i.ibb.co/N261yR19/write.png",
        creator: "WriteWell"
      },
      {
        name: "Grammar & Style Guide",
        description: "Enhance your writing style.",
        image: "https://i.ibb.co/tp2SFKsH/garmmer.png",
        creator: "LinguaPro"
      },
      {
        name: "Essay Architect",
        description: "Structure your essays.",
        image: "https://i.ibb.co/tM6z91tb/essay.png",
        creator: "EssayCraft"
      },
      {
        name: "Storyteller's Studio",
        description: "Craft compelling stories.",
        image: "https://i.ibb.co/7xJKNSqz/story.jpg",
        creator: "StoryForge"
      }
    ],
    "Medicine": [
      {
        name: "Doctor Hana Clinc",
        description: "Assist with medical diagnosis.",
        image: "https://i.ibb.co/6cZzdnpX/doctor.png",
        creator: "Doctor Hana"
      },
      {
        name: "Anatomy Atlas",
        description: "Explore human anatomy.",
        image: "https://i.ibb.co/7tYqSbr3/clic2.png",
        creator: "Anatomy3D"
      },
      {
        name: "Drug Interaction Checker",
        description: "Check drug interactions.",
        image: "https://i.ibb.co/TBBThqFY/pills.png",
        creator: "PharmAlert"
      },
      {
        name: "Surgical Simulator",
        description: "Practice surgical procedures.",
        image: "https://i.ibb.co/MxQyKqJB/drclicnc.jpg",
        creator: "SurgSim"
      }
    ]
  };

  return (
    <div className="bg-transparent text-white min-h-screen flex flex-col items-center justify-start pt-16">
      <div className="container mx-auto max-w-screen-lg py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-extrabold text-center mb-4 text-blue-300">Minds</h1>
        <p className="text-xl text-center mt-2 text-gray-300">
          Explore and create custom versions of MindBot Ai, combining instructions, knowledge, and skills.
        </p>

        <div className="relative mt-8 w-full max-w-3xl mx-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <LuSearch className="w-6 h-6 text-gray-400" />
          </div>
          <input
            type="search"
            id="default-search"
            className="block w-full p-4 pl-12 text-lg text-white border-2 border-blue-500 rounded-2xl bg-neutral-800 bg-opacity-50 focus:ring-blue-400 focus:border-blue-400 transition-colors duration-200"
            placeholder="Search Minds"
            required
          />
        </div>

        <div className="flex justify-center mt-8 space-x-4 overflow-x-auto scrollbar-hide">
          {Object.keys(categoryData).map((category) => (
            <button
              key={category}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-base font-semibold focus:outline-none transition-colors duration-200
                ${activeCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-neutral-800 bg-opacity-40 hover:bg-opacity-60 hover:text-gray-200"
                }`}
              onClick={() => handleCategoryClick(category)}
            >
              <span>{category}</span>
            </button>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-center mb-4">
            {activeCategory === "Top Picks" ? "Featured" : activeCategory}
          </h2>
          <p className="text-gray-400 text-center">
            {activeCategory === "Top Picks"
              ? "Hand-picked Minds trending this month!"
              : `Explore AI tools for ${activeCategory.toLowerCase()}.`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {(categoryData[activeCategory])?.map((item, index) => (
              <div key={index} className="bg-neutral-800 bg-opacity-30 backdrop-blur-md rounded-2xl p-6 hover:bg-opacity-50 transition-all duration-200 border border-neutral-700 h-[150px]">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={150}
                      height={150}
                      layout="responsive"
                      objectFit="cover"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">By {item.creator}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
