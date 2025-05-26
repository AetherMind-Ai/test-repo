"use client";
import React, { useState } from "react";
import DevButton from "../dev-components/dev-button";
import { FiMenu } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { LuCircleDot } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { FaPaintBrush } from "react-icons/fa";
import ReactTooltip from "../dev-components/react-tooltip";
import { LiaTemperatureLowSolid } from "react-icons/lia";
import DevPopover from "../dev-components/dev-popover";
import ThemeSwitch from "./theme-switch";
import { useParams, useRouter } from "next/navigation";
import { User } from "next-auth";
import SidebarChatList from "./sidebar-chat-list";
import { createPortal } from "react-dom";
import MindBotLogo from "../header-components/mindbot-logo";


const SideBar = ({ user, sidebarList }: { user?: User; sidebarList: any }) => {
  const [open, setOpen] = useState(false);
  const [temperature, setTemperature] = useState(1.0);
  const router = useRouter();
  const { chat } = useParams();

  const handleTemperatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTemperature(parseFloat(event.target.value));
  };

  return (
    <section
      className={`h-full md:flex-shrink-0 bg-rtlLight md:transform-none transition-[width] ${
        open
          ? " w-[300px] "
          : " md:w-[70px] w-0 opacity-0 pointer-events-none md:pointer-events-auto md:opacity-100"
      } fixed inset-0 dark:bg-rtlDark p-3 w-[300px] flex flex-col justify-between z-10 md:relative overflow-hidden md:z-0`}
    >
      <div className="mt-14">
        {/* ... (rest of your component - New Chat, MindPaint, Explore Minds) ... */}
        {createPortal(
          <div className="fixed z-[1000] top-3 left-3 flex items-center gap-3">
            <ReactTooltip place="bottom-start" tipData="Collapse menu">
              <DevButton
                onClick={() => setOpen(!open)}
                asIcon
                size="xl"
                rounded="full"
                variant="v3"
              >
                <FiMenu className="text-xl" />
              </DevButton>
            </ReactTooltip>
            <div className="block md:hidden">
              <MindBotLogo />
            </div>
            {chat && (
              <DevButton
                size="lg"
                href="/app"
                className="!text-xl fixed md:hidden top-3 right-32 z-50"
                rounded="full"
                variant="v1"
                asIcon
              >
                <IoMdAdd />
              </DevButton>
            )}
          </div>,
          document.body
        )}
        <ReactTooltip place="bottom" tipData="New chat">
          <DevButton
            onClick={() => router.push(`/app`)}
            rounded="full"
            asIcon={open ? false : true}
            variant="v1"
            className=" mt-5 text-sm gap-3 px-[13px] justify-between md:!flex !hidden"
          >
            <IoMdAdd className="text-xl" /> {open && "New chat"}
          </DevButton>
        </ReactTooltip>
        <ReactTooltip place="bottom" tipData="MindPaint">
          <DevButton
            onClick={() => router.push(`/app/mindpaint`)}
            rounded="full"
            asIcon={open ? false : true}
            variant="v1"
            className=" mt-2 text-sm gap-3 px-[13px] justify-between md:!flex !hidden"
          >
            <FaPaintBrush className="text-xl" /> {open && "MindPaint"}
          </DevButton>
        </ReactTooltip>

        <ReactTooltip place="bottom" tipData="Explore Minds">
          <DevButton
            onClick={() => router.push(`/app/minds`)}
            rounded="full"
            asIcon={open ? false : true}
            variant="v1"
            className="mt-2 text-sm gap-3 px-[13px] justify-between md:!flex !hidden"
          >
            <div className="grid grid-cols-2 gap-0 scale-85">
              <LuCircleDot className="text-xs" />
              <LuCircleDot className="text-xs" />
              <LuCircleDot className="text-xs" />
              <LuCircleDot className="text-xs" />
            </div>
            {open && "Explore Minds"}
          </DevButton>
        </ReactTooltip>

        {open && (
          <h2 className="pl-3 mt-10">
            {sidebarList.success && sidebarList.message.length > 0 && "Recent"}
          </h2>
        )}
      </div>
      <div className={`${open ? "block" : "hidden"} flex-grow overflow-y-auto`}>
        <SidebarChatList sidebarList={sidebarList} />
      </div>
      <div>
        <ul className="mt-5 space-y-1">
          <li>
            {/* Temperature Control and Settings */}
            {open ? (
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <LiaTemperatureLowSolid className="text-xl" />
                  <input
                    type="range"
                    min="0"
                    max="2.5"
                    step="0.1"
                    value={temperature}
                    onChange={handleTemperatureChange}
                    className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:-mt-1" // Adjusted thumb style
                  />
                  <span
                    className="px-2 py-0.5 text-xs font-medium text-gray-800 bg-transparent border border-blue-500 rounded-full dark:text-white"
                  >
                    {temperature.toFixed(1)}
                  </span>
                </div>
                <DevPopover
                  contentClick={false}
                  place="top-end"
                  popButton={
                    <DevButton
                      variant="v3"
                      className="text-sm *:text-xl aspect-auto group !w-full !justify-start gap-3 mt-2" // Added mt-2 for spacing
                      rounded="full"
                    >
                      <IoSettingsOutline />
                      {open && "Settings"}
                    </DevButton>
                  }
                >
                   {/* ... (Popover content - Prompt gallery, Dark theme, Latest Models) ... */}
                   <div className="w-52 py-2">
                  <DevButton
                    variant="v3"
                    href="/app/prompt-gallery"
                    className="w-full !justify-start gap-3 group"
                    rounded="none"
                  >
                    Prompt gallery
                  </DevButton>
                  <DevButton
                    variant="v3"
                    className="w-full !justify-start gap-3 group"
                    rounded="none"
                  >
                    <label
                      htmlFor="toggleBox"
                      className="flex cursor-pointer items-center gap-3"
                    >
                      Dark theme
                      <ThemeSwitch />
                    </label>
                  </DevButton>
                  <DevButton
                    variant="v3"
                    href="/app/mind-models"
                    className="w-full !justify-start gap-3 group"
                    rounded="none"
                  >
                    Latest Models
                  </DevButton>
                </div>
                </DevPopover>
              </div>
            ) : (
              // Collapsed state: Temperature and Settings icons only
              <>
               <ReactTooltip  occupy={false} place="right" tipData={`Temperature: ${temperature.toFixed(1)}`}>
                <DevButton variant="v3" className="text-sm *:text-xl aspect-square group !w-full !justify-center mb-1">
                    <LiaTemperatureLowSolid  className="text-2xl"/>
                </DevButton>
                </ReactTooltip>
                <ReactTooltip occupy={false} place="right" tipData="Settings">
                  <DevPopover
                    contentClick={false}
                    place="top-end"
                    popButton={
                      <DevButton
                        variant="v3"
                        className="text-sm *:text-xl aspect-square group !w-full !justify-center"
                        rounded="full"
                      >
                        <IoSettingsOutline />
                      </DevButton>
                    }
                  >
                   {/* ... (Popover content - Prompt gallery, Dark theme, Latest Models) ... */}
                   <div className="w-52 py-2">
                  <DevButton
                    variant="v3"
                    href="/app/prompt-gallery"
                    className="w-full !justify-start gap-3 group"
                    rounded="none"
                  >
                    Prompt gallery
                  </DevButton>
                  <DevButton
                    variant="v3"
                    className="w-full !justify-start gap-3 group"
                    rounded="none"
                  >
                    <label
                      htmlFor="toggleBox"
                      className="flex cursor-pointer items-center gap-3"
                    >
                      Dark theme
                      <ThemeSwitch />
                    </label>
                  </DevButton>
                  <DevButton
                    variant="v3"
                    href="/app/mind-models"
                    className="w-full !justify-start gap-3 group"
                    rounded="none"
                  >
                    Latest Models
                  </DevButton>
                </div>
                  </DevPopover>
                </ReactTooltip>
              </>
            )}
          </li>
        </ul>
      </div>
    </section>
  );
};

export default SideBar;
