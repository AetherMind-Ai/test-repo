'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const AccountPage = () => {
  const router = useRouter();

  const user = {
    name: "MindBot-1.3 🚀",
    email: "mindbotai.team@gmail.com",
    image: "https://mindbotai.netlify.app/assets/images/logo.png",
    joinedDate: "7/Dec/2024",
    bio: "Welcome to MindBot AI – Empowering Every Move through Artificial Intelligence",
  };

  const codeSnippet = `# Import necessary libraries
from aimindbot import generate_ai_response
if __name__ == '__main__':
    api_key = "your-api-key"  # Replace with your actual MindBot Ai API key
    model = "mindbot-1.3"
    user_prompt = input("Enter your prompt: ")
    response, time = generate_ai_response(api_key, user_prompt)
    if response:
        print("MindBot-1.3:", response)
    else:
        print("Failed to generate a response.")`;

  return (
    <main className="w-full max-w-5xl mx-auto flex flex-col p-6 space-y-8 bg-[#ffffff00] text-gray-100 min-h-screen">
      {/* Page Header */}
      <h2 className="text-animation bg-gradient-to-r from-[#4E82EE] to-[#D96570] bg-clip-text text-4xl text-transparent font-bold text-center">
        MindBot Ai Latest Models
      </h2>

      {/* User Profile Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start p-6 gap-6">
        {/* User Image */}
        <div className="w-32 h-32 md:w-40 md:h-40">
          <img
            src={user.image}
            alt={user.name}
            className="w-full h-full object-cover rounded-full shadow-lg border-4 border-[#a8a3a3]"
          />
        </div>
        {/* User Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-3xl font-semibold text-blue-500">{user.name}</h3>
            <p className="text-gray-500 text-lg">{user.email}</p>
          </div>
          <div className="text-sm text-orange-300">
            <p><strong>Announcement Date:</strong> {user.joinedDate}</p>
            <p>{user.bio}</p>
          </div>
        </div>
      </div>

      {/* MindBot Description Section */}
      <section className="flex flex-col md:flex-row items-center md:items-start gap-8 p-6 bg-[#1c1c1c] rounded-lg shadow-lg">
        {/* Text on Left */}
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-semibold text-gray-50">What is MindBot?</h3>
          <p className="text-gray-300 text-lg">
            MindBot is a cutting-edge artificial intelligence platform designed to assist you in a wide range of tasks. From generating creative content to providing intelligent responses, MindBot is your go-to solution for AI-powered productivity. Whether you're a developer, entrepreneur, or hobbyist, MindBot offers tools that are intuitive and powerful.
          </p>
          <p className="text-gray-300 text-lg">
            With its latest models, MindBot continues to push the boundaries of what's possible with AI. Explore its diverse features and capabilities, and experience how AI can revolutionize your workflow.
          </p>
        </div>
        {/* Image on Right */}
        <div className="w-[260px] h-[200px] mt-[65px]">
          <img
            src="https://i.ibb.co/VD544Fb/mindbot1-3-model.png"
            alt="AI models"
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Separator */}
      <hr className="border-t-2 border-gray-500 my-8" />

      {/* API Description Section */}
      <section className="p-6 bg-[#1c1c1c] rounded-lg shadow-lg space-y-4">
        <h3 className="text-2xl font-semibold text-gray-50">MindBot API - Powering Your Interactions</h3>
        <p className="text-gray-300 text-lg">
          The MindBot API allows developers to harness the power of MindBot's generative AI models. By integrating this API into your application, you can generate human-like responses for any text input, enhancing user experiences across various domains such as customer service, content generation, and more.
        </p>
        <p className="text-gray-300 text-lg">
          With the API, users can send requests and receive AI-generated responses asynchronously, optimizing both speed and accuracy. The system supports various use cases, from simple queries to complex, multi-step interactions.
        </p>
        <p className="text-gray-300 text-lg">
          Here’s a Python code example that shows how to integrate with the MindBot API. The script allows you to send user inputs to the AI and get responses in real time:
        </p>

        {/* Code Block with Custom Styling */}
        <div className="w-full bg-[#2d2d2d] rounded-lg p-6 overflow-auto">
          <pre
            className="text-[#ADD8E6] font-mono whitespace-pre-wrap text-sm leading-relaxed"
            style={{ backgroundColor: '#2d2d2d', padding: '16px', borderRadius: '8px' }}
          >
            {codeSnippet}
          </pre>
        </div>
      </section>

      {/* Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('https://mindbotai.netlify.app/more-apis.html')}
          className="bg-gradient-to-r from-[#4E82EE] to-[#D96570] text-white py-3 px-6 rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          More Models
        </button>
        <button
          onClick={() => router.push('/app')}
          className="bg-gradient-to-r from-[#4E82EE] to-[#1a807b] text-white py-3 px-6 rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          Start NewChat
        </button>
        <button
          onClick={() => router.push('https://mindbotai.netlify.app/api')}
          className="bg-gradient-to-r from-[#ee9b4e] to-[#1a807b] text-white py-3 px-6 rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          Api Keys
        </button>
      </div>
    </main>
  );
};

export default AccountPage;
