"use client";
import React, { useState, useRef, useEffect } from "react";
import MindBotZustand from "@/utils/mindbot-zustand";
import { IoMdDownload } from "react-icons/io";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { MdFileUpload, MdRefresh } from "react-icons/md";

const MindStyleBar: React.FC = () => {
  const { currChat, isMindStyleOpen } = MindBotZustand();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string | null>(null);
  const [isFallbackResponse, setIsFallbackResponse] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reactions, setReactions] = useState<{ liked: boolean; disliked: boolean }>({
    liked: false,
    disliked: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isMindStyleOpen) {
      setGeneratedImage(null);
      setResponseText(null);
      setError(null);
      setIsFallbackResponse(false);
      setReactions({ liked: false, disliked: false });
      setUploadedImageUrl(null);
    }
  }, [isMindStyleOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setGeneratedImage(null);
    setResponseText(null);
    setIsFallbackResponse(false);
    setReactions({ liked: false, disliked: false });
    setUploadedImageUrl(null);

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setUploadedImage(event.target.result);
        setUploadedImageName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartEditing = async () => {
    if (!uploadedImage || !currChat?.userPrompt) {
      setError("Please upload an image and enter a text prompt");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponseText(null);
    setGeneratedImage(null);
    setIsFallbackResponse(false);
    setReactions({ liked: false, disliked: false });
    setUploadedImageUrl(null);

    try {
      const response = await fetch("/api/genai-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currChat.userPrompt,
          image: uploadedImage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Failed to process request");
      }

      const data = await response.json();
      setResponseText(data.responseText);
      setGeneratedImage(data.generatedImage);
      setUploadedImageUrl(data.uploadedImageUrl);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = (type: "like" | "dislike") => {
    setReactions((prev) => ({
      liked: type === "like" ? !prev.liked : false,
      disliked: type === "dislike" ? !prev.disliked : false,
    }));
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const a = document.createElement("a");
      a.href = generatedImage;
      a.download = `mindstyle-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleRetry = () => {
    setGeneratedImage(null);
    setResponseText(null);
    setError(null);
    setIsFallbackResponse(false);
    setReactions({ liked: false, disliked: false });
    setUploadedImageUrl(null);
  };

  return (
    <section
      className={`fixed top-0 right-0 h-full w-[400px] bg-rtlLight dark:bg-rtlDark p-3 flex flex-col z-10 overflow-hidden transform transition-transform duration-300 ease-in-out ${
        isMindStyleOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="pt-4 flex-grow flex flex-col items-center overflow-y-auto">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
            MindStyle-2.0 Results
          </h3>
        </div>

        <div className="w-full space-y-4 mt-4 pb-4">
          {/* First Image Div: Uploaded Image */}
          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg relative">
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="Uploaded Image"
                className="w-full h-full object-cover"
                width={256}
                height={256}
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                onClick={handleUploadClick}
              >
                <MdFileUpload className="w-12 h-12 text-gray-500 dark:text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload Image</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>

          {uploadedImage && (
            <div className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg mt-2 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Current prompt:
              </h4>
              <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
                {currChat?.userPrompt || "No prompt entered yet. Type in the input area below."}
              </p>
            </div>
          )}

          {uploadedImage && !responseText && !isLoading && !error && (
            <div className="w-full p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4 border border-yellow-200 dark:border-yellow-800">
              <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
                About MindStyle-2.0:
              </h4>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                MindStyle is still under development and it attempts to edit your image using Imagen 3, MindVision-Flash, MindPaint-2.0 and MindSearch-2.0 image generation models based on your prompt. If editing fails, Please Try again Later.
              </p>
            </div>
          )}

          {responseText && (
            <div
              className={`w-full p-3 rounded-lg mb-4 border ${
                isFallbackResponse
                  ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                  : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
              }`}
            >
              <h4
                className={`text-sm font-semibold mb-1 ${
                  isFallbackResponse ? "text-orange-700 dark:text-orange-300" : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {isFallbackResponse ? "MindStyle couldn't edit the image:" : "MindStyle's response:"}
              </h4>
              <p className="text-sm text-gray-800 dark:text-gray-200 break-words">{responseText}</p>
            </div>
          )}

          {/* Second Image Div: Generated Image */}
          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg relative group">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : generatedImage && !isFallbackResponse ? (
              <>
                <img
                  src={generatedImage}
                  alt="Generated Image"
                  className="w-full h-full object-cover"
                  width={256}
                  height={256}
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={handleDownload}
                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Download image"
                  >
                    <IoMdDownload className="w-5 h-5 text-gray-800 dark:text-white" />
                  </button>
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <button
                      onClick={() => handleReaction("like")}
                      className={`p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        reactions.liked ? "text-blue-500" : "text-gray-800 dark:text-white"
                      }`}
                      title="Like image"
                    >
                      <FaThumbsUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReaction("dislike")}
                      className={`p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        reactions.disliked ? "text-red-500" : "text-gray-800 dark:text-white"
                      }`}
                      title="Dislike image"
                    >
                      <FaThumbsDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 px-4 text-center">
                  {error ||
                    (isFallbackResponse
                      ? "See analysis above. Image editing failed or is unavailable."
                      : "Edited image will appear here")}
                </p>
              </div>
            )}
          </div>

          {/* Third Section: Display the imgBB URL */}
          {uploadedImageUrl && (
            <div className="w-full p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
                Uploaded to imgBB:
              </h4>
              <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
                <a
                  href={uploadedImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {uploadedImageUrl}
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="w-3/4 flex flex-col gap-2">
          <button
            onClick={handleStartEditing}
            disabled={!uploadedImage || !currChat?.userPrompt || isLoading}
            className={`py-2 rounded-lg font-medium transition-colors ${
              !uploadedImage || !currChat?.userPrompt || isLoading
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isLoading ? "Processing..." : "Edit Image with MindStyle"}
          </button>

          {(generatedImage || responseText) && !isLoading && (
            <button
              onClick={handleRetry}
              className="mt-2 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white flex items-center justify-center"
            >
              <MdRefresh className="mr-2" /> Try Different Prompt
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default MindStyleBar;
