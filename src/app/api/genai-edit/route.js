import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import FormData from "form-data";

// Helper: Ensure uploads directory exists
// This function is no longer needed for uploaded images,
// but might be kept if generated images are saved locally in the future.
// For now, we'll comment it out or remove it if confirmed unnecessary elsewhere.
/*
function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  return uploadsDir;
}
*/

export async function POST(request) {
  try {
    const { prompt, image } = await request.json();
    if (!prompt || !image) {
      return NextResponse.json({ error: "Missing prompt or image" }, { status: 400 });
    }

    // Extract the base64 data directly from the incoming data URL.
    const base64Data = image.split(",")[1];
    if (!base64Data) {
      return NextResponse.json({ error: "Invalid image data format" }, { status: 400 });
    }

    // --- Remove saving the uploaded image ---
    // const uploadsDir = ensureUploadsDir();
    // const uploadFilename = `upload-${Date.now()}.png`;
    // const imagePath = path.join(uploadsDir, uploadFilename);
    // fs.writeFileSync(imagePath, Buffer.from(base64Data, "base64"));

    // --- Remove reading the saved file ---
    // const imageData = fs.readFileSync(imagePath);
    // const base64Image = imageData.toString("base64");

    // Prepare Gemini input using the base64 data directly from the request.
    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/png", // Assuming PNG, might need logic to detect type if varied
          data: base64Data, // Use the data directly
        },
      },
    ];

    // Call the Gemini API – ensure process.env.GENAI_API_KEY is set (or hardcode for testing)
    const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents,
      config: { responseModalities: ["Text", "Image"] },
    });

    let responseText = "";
    let generatedImageBase64 = null;
    for (const part of aiResponse.candidates[0].content.parts) {
      if (part.text) {
        responseText = part.text;
      } else if (part.inlineData) {
        generatedImageBase64 = part.inlineData.data;
      }
    }
    const generatedImageDataUrl = generatedImageBase64
      ? `data:image/png;base64,${generatedImageBase64}`
      : null;

    // --- Upload the generated image to imgbb using form-data ---
    let uploadedImageUrl = null;
    if (generatedImageBase64) {
      const form = new FormData();
      form.append("key", "c30ee80a0f02d90c85d7177e9a089b59");
      form.append("image", generatedImageBase64);

      // imgbb API endpoint with expiration=600 seconds.
      const imgbbRes = await fetch("https://api.imgbb.com/1/upload?expiration=600", {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      });
      const imgbbData = await imgbbRes.json();
      console.log("imgbb response:", imgbbData);
      if (imgbbData && imgbbData.success && imgbbData.data.url) {
        uploadedImageUrl = imgbbData.data.url;
      }
    }

    return NextResponse.json({
      responseText,
      generatedImage: generatedImageDataUrl,
      uploadedImageUrl,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
