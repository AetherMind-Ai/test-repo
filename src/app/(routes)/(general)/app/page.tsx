import { auth } from "@/auth";
import HomeCards from "@/components/temp-components/home-cards";
import React from "react";

const page = async () => {
  const session = await auth();

  return (
    <section className="mt-5 w-full max-w-4xl mx-auto md:p-10 p-5 animate-fade-in">
      <h2 className="inline-block bg-gradient-to-r from-[#4E82EE] to-[#47f1d4] bg-clip-text md:text-5xl text-4xl text-transparent font-semibold animate-text-reveal">
        Hello, {session?.user ? session?.user.name?.split(" ")[0] : "Guest"}
      </h2>
      <h3 className="md:text-5xl text-4xl text-wrap text-accentGray/50 animate-text-reveal delay-200">
        {session?.user ? "How can I help you today?" : "Sign in to get started"}
      </h3>
      <div className="animate-fade-up delay-300">
        <HomeCards />
      </div>
    </section>
  );
};

export default page;
