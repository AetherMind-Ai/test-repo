"use client";

import React from "react"; // Removed useState
import { User } from "next-auth";
import MindBotZustand from "@/utils/mindbot-zustand"; // Import Zustand store
import SideBar from "@/components/sidebar-components/sidebar"; 
import Header from "@/components/header-components/header";
import InputPrompt from "@/components/input-prompt-components/input-prompt";
import DevToast from "@/components/dev-components/dev-toast";
import Sourcebar from "@/components/sourcebar-components/sourcebar";
import MindPaintBar from "@/components/mindpaintbar-components/mindpaintbar";
import MindStyleBar from "@/components/mindstylebar-components/mindstylebar";
import MindCanvasSidebar from "./mind-canvas-components/mind-canvas-sidebar"; // Import MindCanvasSidebar

interface LayoutClientWrapperProps {
  children: React.ReactNode;
  sessionUser: User | undefined;
  sidebarList: any; // Adjust type as needed
}

const LayoutClientWrapper: React.FC<LayoutClientWrapperProps> = ({
  children,
  sessionUser,
  sidebarList,
}) => {
  // Get sidebar state from Zustand store
  const { isSourcebarOpen, isMindPaintOpen, isMindCanvasOpen } = MindBotZustand();
  // Removed local isGlobeActive state

  return (
    <main className="h-dvh w-full flex overflow-hidden">
      <SideBar user={sessionUser} sidebarList={sidebarList} />

      <div className="flex flex-grow h-full overflow-hidden flex-col justify-between relative">
        {/* Pass sessionUser down to Header */}
        <Header sessionUser={sessionUser} />
        <section className="w-full flex-grow overflow-y-auto relative mx-auto">
          {children}
        </section>
        {/* Remove isGlobeActive and setIsGlobeActive props */}
        <InputPrompt user={sessionUser} />
      </div>
      <DevToast />
      {/* Pass isSourcebarOpen from Zustand to Sourcebar */}
      <Sourcebar isActive={isSourcebarOpen} />
      <MindPaintBar />
      <MindStyleBar />

      {/* Conditionally render MindCanvasSidebar */}
      {isMindCanvasOpen && <MindCanvasSidebar />}
    </main>
  );
};

export default LayoutClientWrapper;
