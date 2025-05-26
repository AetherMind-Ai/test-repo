"use client";

import { FaCaretDown, FaRegCheckCircle, FaRobot, FaStar, FaRocket, FaAtom } from "react-icons/fa";
import { BsLightningFill } from "react-icons/bs";
import { LuAtom } from "react-icons/lu";
import DevButton from "../dev-components/dev-button";
import DevPopover from "../dev-components/dev-popover";

const MindBotLogo = () => {
  const versionDetails = {
    "MindBot-1.5-Pro": "Fast, accurate, and reliable.",
    "MindBot-1.5": "Creative, sharper, and thinker.",
  };

  const versionIcons = {
    "MindBot 1.4": <BsLightningFill key="bolt" className="text-[#d36e6e] ml-3.5" />,
    "MindBot 1.3": <LuAtom key="atom" className="text-yellow-500 ml-3.5" />, // New Atom Icon
  };

  return (
    <DevPopover
      popButton={
        <DevButton size="sm" rounded="sm" className="text-lg gap-2">
          MindBot Ai
          <FaCaretDown />
        </DevButton>
      }
    >
      <div className="py-2 flex flex-col">
        {/* MindBot 1.4 */}
        <div className="rounded-md p-2 shadow-sm transition-shadow duration-200 hover:shadow-none">
          <DevButton
            variant="v3"
            rounded="none"
            className="w-full flex items-center gap-2 justify-between"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'transparent';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'transparent';
            }}
          >
            <div className="flex items-center gap-2" style={{ backgroundColor: 'transparent' }}>
              <FaRobot className="text-lg text-[#4E82EE]" />
              MindBot-1.5-Pro
            </div>
            <FaRocket className="text-xl text-[#d36e6e]" />
          </DevButton>
          <div className="flex items-center gap-1 mt-1">
            {versionIcons["MindBot 1.4"]}
            <p className="text-xs text-gray-500 py-1 ml-1">{versionDetails["MindBot-1.5-Pro"]}</p>
          </div>
        </div>

        <hr style={{ margin: "5px 10px", border: "none", borderTop: "1px solid #ccc" }} />

        {/* MindBot 1.3 */}
        <div className="rounded-md p-2 shadow-sm transition-shadow duration-200 hover:shadow-none">
          <DevButton
            variant="v3"
            rounded="none"
            className="w-full flex items-center gap-2 justify-between"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'transparent';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'transparent';
            }}
          >
            <div className="flex items-center gap-2" style={{ backgroundColor: 'transparent' }}>
              <FaRobot className="text-lg text-[#4E82EE]" />
              MindBot-1.5
            </div>
            <FaStar className="text-xl text-yellow-500" />
          </DevButton>
          <div className="flex items-center gap-1 mt-1">
            {versionIcons["MindBot 1.3"]}
            <p className="text-xs text-gray-500 py-1 ml-1">{versionDetails["MindBot-1.5"]}</p>
          </div>
        </div>
      </div>
    </DevPopover>
  );
};

export default MindBotLogo;
