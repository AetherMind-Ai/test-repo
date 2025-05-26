import React from "react";
import SignInNow from "@/components/header-components/signin-now";
// Removed auth import
import TopLoader from "./top-loader";
import MindBotLogo from "./mindbot-logo";
import { IoMdAdd } from "react-icons/io";
import DevButton from "../dev-components/dev-button";
import { User } from "next-auth"; // Import User type

// Define props interface
interface HeaderProps {
  sessionUser: User | undefined;
}

// Accept props and remove async
const Header: React.FC<HeaderProps> = ({ sessionUser }) => {
  // Removed await auth() call
  return (
    <header className="w-full h-fit flex-shrink-0 flex items-center p-3 md:px-10 px-5 md:justify-between relative justify-end">
      <div className="md:block hidden">
        <MindBotLogo />
      </div>
     
      {/* Pass sessionUser down as userData */}
      <SignInNow userData={sessionUser} /> 
      <TopLoader />
    </header>
  );
};

export default Header;
