"use client";

import { useState } from "react";
import * as mi from "@magenta/image";
import './style.css';

export default function Page() {
  const [contentImage, setContentImage] = useState<string | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [styledImage, setStyledImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleStartStyling = async () => {
    if (!contentImage || !styleImage) {
      alert("Please upload both images to start styling.");
      return;
    }

    setLoading(true);

    try {
      const model = new mi.ArbitraryStyleTransferNetwork();
      await model.initialize();

      const contentImg = document.createElement("img");
      contentImg.src = contentImage!;
      const styleImg = document.createElement("img");
      styleImg.src = styleImage!;

      await new Promise((resolve) => {
        contentImg.onload = resolve;
        styleImg.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context is not available.");
      }

      canvas.width = contentImg.width;
      canvas.height = contentImg.height;

      const imageData = await model.stylize(contentImg, styleImg);

      ctx.putImageData(imageData, 0, 0);
      const resultImageUrl = canvas.toDataURL();

      setStyledImage(resultImageUrl);
    } catch (error) {
      console.error("Error during style transfer:", error);
      alert("An error occurred during the styling process.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (styledImage) {
      const link = document.createElement("a");
      link.href = styledImage;
      link.download = "styled-image.png";
      link.click();
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-wrap justify-center items-center gap-16">
        <div className="text-center">
          {contentImage ? (
            <img
              src={contentImage}
              alt="Content"
              className="w-72 h-72 object-cover border rounded-[20px] shadow-lg"
            />
          ) : (
            <div className="w-72 h-72 flex items-center justify-center border bg-gray-100 text-gray-500 rounded-[20px] shadow-lg">
              Content Image
            </div>
          )}
          <button
            onClick={() => document.getElementById("contentUpload")?.click()}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Upload Content Image
          </button>
          <input
            type="file"
            id="contentUpload"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleImageUpload(e, setContentImage)}
          />
        </div>

        {/* Space Between - Removed fixed height */}
        <div className="w-6" />

        <div className="text-center">
          {styleImage ? (
            <img
              src={styleImage}
              alt="Style"
              className="w-72 h-72 object-cover border rounded-[20px] shadow-lg"
            />
          ) : (
            <div className="w-72 h-72 flex items-center justify-center border bg-gray-100 text-gray-500 rounded-[20px] shadow-lg">
              Style Image
            </div>
          )}
          <button
            onClick={() => document.getElementById("styleUpload")?.click()}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Upload Style Image
          </button>
          <input
            type="file"
            id="styleUpload"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleImageUpload(e, setStyleImage)}
          />
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={handleStartStyling}
          className="bg-green-500 text-white px-6 py-3 rounded"
          disabled={loading}
        >
          {loading ? "Styling..." : "Start Styling"}
        </button>
      </div>

      {/* Loading Dots */}
      {loading && (
        <div className="flex justify-center items-center mt-8">
          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      )}

      {styledImage && (
        <div className="mt-8 text-center">
          <img
            src={styledImage}
            alt="Styled"
            className="w-80 h-80 object-cover border mx-auto rounded-[20px] shadow-lg"
          />
          <button
            onClick={handleDownload}
            className="mt-4 bg-purple-500 text-white px-4 py-2 rounded"
          >
            Download Styled Image
          </button>
        </div>
      )}
    </div>
  );
}