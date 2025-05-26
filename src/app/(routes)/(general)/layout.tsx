import { auth } from "@/auth";
import { getSidebarChat } from "@/actions/actions";
import { Analytics } from "@vercel/analytics/react";
import React from "react";
import LayoutClientWrapper from "@/components/layout-client-wrapper"; // Import the client wrapper

// Removed "use client" and useState import

// Removed Sidebar, Header, InputPrompt, DevToast, Sourcebar imports as they are handled by the wrapper

const GeneralLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  const sidebarList = await getSidebarChat(session?.user?.id as string);
  // Removed useState for isGlobeActive

  return (
    // Render the client wrapper, passing fetched data and children
    <LayoutClientWrapper sessionUser={session?.user} sidebarList={sidebarList}>
      {children}
    </LayoutClientWrapper>
  );
};

export default GeneralLayout;
