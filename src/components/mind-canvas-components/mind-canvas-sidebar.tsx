"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import MindBotZustand from '@/utils/mindbot-zustand';
import DevButton from '../dev-components/dev-button';
import ReactTooltip from '../dev-components/react-tooltip';
import { FiCopy, FiDownload, FiEdit, FiSave, FiFileText, FiUploadCloud, FiSend } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import { LuFileSpreadsheet } from "react-icons/lu";
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import { MdContentCopy } from 'react-icons/md';
import { IoCheckmarkDoneSharp } from 'react-icons/io5';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part } from "@google/genai";

// Helper function to format bytes
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to convert File to GenerativePart (Corrected)
async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',', 2)[1]);
    reader.onerror = (error) => reject(error); // Reject the promise on reader error
    reader.readAsDataURL(file);
  });
  try {
      const base64Data = await base64EncodedDataPromise;
      return {
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'text/csv', // Add default mime type just in case
        },
      };
  } catch (error) {
       console.error("Error reading file for AI:", error);
       // Explicitly re-throw the error to satisfy linter and propagate failure
       throw new Error(`Failed to read file data: ${error instanceof Error ? error.message : String(error)}`);
  }
  // No return needed here as all paths either return or throw
}

const exampleText = `
# Heading Level 1
## Heading Level 2
### Heading Level 3

_This text is italic_

<u>This text is underlined</u>

[Visit MindBot](https://mindbot.ai)

---

## Mind Canvas ✨

A modern Markdown editor with code, tables & diagrams.

### Example Code

\`\`\`javascript
const sayHi = (name) => {
  console.log(\`Hey, \${name}!\`);
}
sayHi("MindBot");
\`\`\`

### Extended Table

| Feature        | Support | Description              | Example                     |
|----------------|---------|--------------------------|-----------------------------|
| Markdown       | ✅      | Headings, lists, links    | \`# Title\`                 |
| Tables         | ✅      | GFM-style tables          | \`| A | B |\`               |
| Code Blocks    | ✅      | Syntax highlighted        | \`console.log()\`           |
| Mermaid Charts | ✅      | Pie chart diagram         | \`pie ...\`                 |

### Mermaid Pie Chart

\`\`\`mermaid
pie
    title MindBot Features
    "Markdown" : 50
    "Tables" : 25
    "Code Blocks" : 15
    "Charts" : 10
\`\`\`
`;

// -- Start of Memoized Content Component --
interface MindCanvasContentProps {
    canvasText: string;
    isEditing: boolean;
    copiedBlockIndex: number | null;
    onCanvasTextChange: (text: string) => void;
    onCodeCopy: (code: string, index: number) => void;
}

const MindCanvasContent: React.FC<MindCanvasContentProps> = React.memo(
    ({ canvasText, isEditing, copiedBlockIndex, onCanvasTextChange, onCodeCopy }) => {
        let codeBlockCounter = 0;
        if (!isEditing) codeBlockCounter = 0; // Reset counter when switching to view mode

        // Memoize the components configuration if it doesn't depend on rapidly changing state
        const markdownComponents = {
             table: ({ node, ...props }: any) => (
                <table className="w-full my-4 border-collapse rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 overflow-hidden" {...props} />
            ),
            thead: ({ node, ...props }: any) => (
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100" {...props} />
            ),
            th: ({ node, ...props }: any) => (
                <th className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-left font-semibold text-sm" {...props} />
            ),
            tr: ({ node, ...props }: any) => (
                <tr className="transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0" {...props} />
            ),
            td: ({ node, ...props }: any) => (
                <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm" {...props} />
            ),
            a: ({ node, ...props }: any) => (
                <a className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500 underline" {...props} />
            ),
            p: ({ node, children, ...props }: any) => {
                if (typeof children === 'string' && children.startsWith('£ ')) {
                    return <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-100" {...props}>{children.substring(2)}</h3>;
                }
                return <p className="my-2 text-gray-700 dark:text-gray-300" {...props}>{children}</p>;
            },
            code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                const currentBlockIndex = codeBlockCounter++;
                const codeContent = String(children).replace(/\n$/, '');

                if (match?.[1] === 'mermaid') {
                    // IMPORTANT: Mermaid rendering is handled by the useEffect in the parent component
                    // Return a placeholder that the useEffect can find
                    return <pre><code className="language-mermaid">{codeContent}</code></pre>;
                }

                return !inline && match ? (
                    <div className="relative group my-4">
                        <DevButton
                            onClick={() => onCodeCopy(codeContent, currentBlockIndex)}
                            asIcon
                            variant="v3"
                            className="absolute top-2 right-2 p-1 text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                            {copiedBlockIndex === currentBlockIndex
                                ? <IoCheckmarkDoneSharp size={16} className="text-green-400" />
                                : <MdContentCopy size={16} />}
                        </DevButton>
                        <SyntaxHighlighter
                            style={tomorrow}
                            customStyle={{ borderRadius: '0.75rem', padding: '1rem', background: '#1e1e1e' }}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                        >
                            {codeContent}
                        </SyntaxHighlighter>
                    </div>
                ) : (
                    <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">{children}</code>
                );
            }
        };

        return (
            <div className="flex-grow px-6 py-4 overflow-y-auto text-sm leading-relaxed">
                {isEditing ? (
                    <textarea
                        value={canvasText}
                        onChange={(e) => onCanvasTextChange(e.target.value)}
                        className="w-full h-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg p-4 font-mono focus:outline-none resize-none"
                        style={{ minHeight: '400px' }}
                    />
                ) : (
                    <ReactMarkdown
                        className="prose dark:prose-invert max-w-none"
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={markdownComponents}
                    >
                        {canvasText}
                    </ReactMarkdown>
                )}
            </div>
        );
    }
);
MindCanvasContent.displayName = 'MindCanvasContent'; // Add display name for DevTools
// -- End of Memoized Content Component --

const MindCanvasSidebar = () => {
    const { isMindCanvasOpen, promptText, canvasInputText, setCanvasInputText } = MindBotZustand();
    const [isEditing, setIsEditing] = useState(false);
    const [copiedBlockIndex, setCopiedBlockIndex] = useState<number | null>(null);
    const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
    const [csvFileObject, setCsvFileObject] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const genAI = useRef<GoogleGenAI | null>(null);

    useEffect(() => {
        // Initialize AI model only once on mount
        if (process.env.NEXT_PUBLIC_API_KEY) {
            // Use the new SDK initialization with options object
            genAI.current = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY });
        } else {
            console.error("API Key (NEXT_PUBLIC_API_KEY) not found for Generative AI");
        }
    }, []);

    useEffect(() => {
        if (isMindCanvasOpen) {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            mermaid.initialize({ startOnLoad: false, theme: prefersDark ? 'dark' : 'default', securityLevel: 'loose' });
        }
    }, [isMindCanvasOpen]);

    useEffect(() => {
        if (!isEditing && isMindCanvasOpen) {
            document.querySelectorAll('pre > code.language-mermaid').forEach((block) => {
                const code = (block as HTMLElement).innerText;
                mermaid.render('mermaid-' + Math.random().toString(36).slice(2), code).then(({ svg }) => {
                    if (block.parentNode) {
                        const container = document.createElement('div');
                        container.innerHTML = svg;
                        const pieText = container.querySelectorAll('.pie text');
                        pieText.forEach(el => {
                            (el as SVGTextElement).style.fill = document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937';
                        });
                        const pieTitle = container.querySelector('.pieTitle');
                        if (pieTitle) {
                            (pieTitle as SVGTextElement).style.fill = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563';
                        }
                        (block.parentNode as HTMLElement).replaceWith(container);
                    }
                }).catch(console.error);
            });
        }
    }, [canvasInputText, isEditing, isMindCanvasOpen]);

    const handleCopy = () => navigator.clipboard.writeText(canvasInputText);
    const handleDownload = () => {
        const blob = new Blob([canvasInputText], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mindcanvas.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    const toggleEdit = () => setIsEditing(!isEditing);

    const handleCodeCopy = useCallback((code: string, index: number) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedBlockIndex(index);
            setTimeout(() => setCopiedBlockIndex(null), 1500);
        });
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
            setUploadedFile({ name: file.name, size: file.size });
            setCsvFileObject(file);
        } else if (file) {
            alert('Please upload a CSV file.');
            setUploadedFile(null);
            setCsvFileObject(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } else {
             if (fileInputRef.current) {
                 fileInputRef.current.value = "";
             }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleCanvasSubmit = async () => {
        if (!genAI.current) {
            console.error("AI model not initialized.");
            return;
        }
        if (!promptText.trim() || !csvFileObject) {
            console.error("Prompt text and CSV file are required for analysis.");
            return;
        }

        setIsAnalyzing(true);
        setCanvasInputText("# Analyzing...\n\nPlease wait while the AI processes your request.");

        let analysisPrompt = promptText.trim();
        const fileParts: Part[] = [];

        const csvFileName = csvFileObject?.name ?? "uploaded_data.csv";

        if (csvFileObject) {
            const fileProcessingPrompt = `Analyze the following CSV data (${csvFileName}).`;
            analysisPrompt = `${fileProcessingPrompt}\n\nUser's specific request: ${analysisPrompt}`;
            try {
                const filePart = await fileToGenerativePart(csvFileObject);
                fileParts.push(filePart);
            } catch (error) {
                console.error("Error processing file for AI:", error);
                setCanvasInputText(`# Error\n\nFailed to process the uploaded file: ${error instanceof Error ? error.message : String(error)}`);
                setIsAnalyzing(false);
                return;
            }
        }

        const systemPrompt = `
You are MindAnalysis-1.0, an expert data analyst AI powered by MindBot-1.5-Pro and developed by Ahmed Helmy Eletr. You are assisting a user within a tool called Mind Canvas.
**Do not introduce yourself unless explicitly asked.**

Use emojis where appropriate to make the response engaging, but **never use emojis within code blocks**. Avoid excessive emoji usage.

**Custom Header Syntax:** To indicate a header in your response, prefix the line with a '£' sign. (e.g., '£ This is a Header'). The frontend will handle styling this.

The user has uploaded a CSV file named "${csvFileName}" and provided the following request: "${analysisPrompt}".

Your task is to analyze the CSV based on the user's request and generate a response in Markdown format. **Utmost accuracy and strict adherence to the following structure are critically important. There should be no deviations.**

1.  **£ Analysis Acknowledgment:** Briefly state that you are analyzing the file based on the user's request.
2.  **£ Python Code:** Generate **100% accurate and runnable** Python code using the 'pandas' library to perform the analysis requested by the user.
    - The code **must** directly address the user's specific request with precision.
    - Assume the CSV data is loaded into a pandas DataFrame (e.g., \`df = pd.read_csv(...)\`, but you don't need to write the actual file reading part).
    - Add clear, concise comments explaining the *purpose* of key steps.
    - Ensure correct syntax and follow standard pandas practices meticulously.
    - **CRITICAL: The \`\`\`python ... \`\`\` block must contain ONLY valid Python code and standard Python comments (starting with #). Absolutely NO other text is allowed within this block.**
3.  **£ Code Explanation:** Explain **accurately** what the Python code does step-by-step and mention how someone could theoretically run it (e.g., "Save this as a .py file, ensure pandas is installed ('pip install pandas'), and run it assuming the CSV is in the same directory").
4.  **£ Data Table Preview:** Display a Markdown table showing a preview of the relevant data (either before or after analysis, as appropriate to the request). Limit the table to a maximum of 10 rows and 10 columns, but aim for roughly 4-6 rows/columns.
5.  **£ Summary:** Provide a concise text summary of the key findings or results derived from the analysis, ensuring it is **directly and accurately based** on the user's specific request. Use a level 2 Markdown heading: "## Summary".

---

6.  **£ Data Distribution (Pie Chart):** Generate a **syntactically perfect and SMALL** Mermaid Pie chart visualizing a relevant categorical aspect of the data.
    - **Choose a suitable categorical column** automatically if the user didn't specify one. If there are many categories, consider grouping smaller ones into an 'Other' category (e.g., top 5-7 categories + Other).
    - Include a clear \`title\` for the chart.
    - Ensure each slice has a **label and its correct value (or percentage)**
    - The chart must be **SMALL**.
    - Use a level 3 Markdown heading: "### Data Distribution".
    - **Immediately after the heading, add a Markdown horizontal rule (---).**
    - **CRITICAL: Ensure the Mermaid code block (\`\`\`mermaid ... \`\`\`\`) follows the horizontal rule and is perfectly formatted with correct syntax.**

Please ensure the entire output is valid Markdown and adheres **absolutely strictly** to these sections and accuracy requirements.
`;

        try {
            const contents = [
                { role: "user", parts: [ {text: systemPrompt}, ...fileParts ] }
            ];

            if (!genAI.current) {
                 throw new Error("AI Model client is not available.");
            }

            const result = await genAI.current.models.generateContent({ 
                model: "gemini-2.0-flash",
                contents: contents 
            });

            if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
                const generatedText = result.candidates[0].content.parts[0].text;
                console.log("AI Response Received.");
                setCanvasInputText(generatedText);
            } else {
                 console.error("Unexpected AI response structure or empty text:", result);
                 throw new Error("Failed to extract text from AI response.");
            }

        } catch (err: unknown) { 
            console.error("Error during AI analysis:", err);
            setCanvasInputText(`# Analysis Error\n\nAn error occurred: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!isMindCanvasOpen) return null;

    return (
        <div className="fixed top-0 right-0 h-full w-[40rem] bg-rtlLight dark:bg-rtlDark flex flex-col z-10 overflow-hidden transform transition-transform duration-300 ease-in-out shadow-2xl border-l border-gray-200 dark:border-gray-700 ${isMindCanvasOpen ? 'translate-x-0' : 'translate-x-full'}">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    MindAnalysis
                </h3>
                <div className="flex items-center space-x-3">
                    <ReactTooltip tipData={isEditing ? "Save View" : "Edit Content"}>
                        <DevButton onClick={toggleEdit} variant="v2" asIcon={!isEditing} className={`p-2 rounded-md ${isEditing ? 'w-28' : ''}`}>
                            {isEditing ? ( <><FiSave className="mr-2 w-5 h-5" /> Save View</> ) : ( <FiEdit title="Edit Content" className="w-5 h-5" /> )}
                        </DevButton>
                    </ReactTooltip>
                    <ReactTooltip tipData="Copy Content">
                        <DevButton onClick={handleCopy} variant="v2" asIcon disabled={!canvasInputText} className="p-2 rounded-md">
                            <FiCopy className="w-5 h-5"/>
                        </DevButton>
                    </ReactTooltip>
                    <ReactTooltip tipData="Download as Markdown">
                        <DevButton onClick={handleDownload} variant="v2" asIcon disabled={!canvasInputText} className="p-2 rounded-md">
                            <FiDownload className="w-5 h-5"/>
                        </DevButton>
                    </ReactTooltip>
                    {/* Removed Upload CSV button from header */}
                    {/* 
                    <ReactTooltip tipData="Upload CSV for Analysis">
                        <DevButton onClick={handleUploadClick} variant="v2" asIcon className="p-2 rounded-md">
                            <LuFileSpreadsheet className="w-5 h-5"/>
                        </DevButton>
                    </ReactTooltip> 
                    */}
                    {/* Change Analyze button text to Start */}
                    <ReactTooltip tipData="Start Analysis">
                        <DevButton
                            onClick={handleCanvasSubmit}
                            variant="v2"
                            disabled={isAnalyzing || !promptText.trim() || !csvFileObject}
                            className="flex items-center p-2 rounded-md"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <FiSend className="mr-2 w-5 h-5" /> Start
                                </>
                            )}
                        </DevButton>
                    </ReactTooltip>
                </div>
            </div>

            <div className="flex items-stretch space-x-4 p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-100 dark:bg-gray-800/50">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    style={{ display: 'none' }}
                />
                <div
                    onClick={!uploadedFile ? handleUploadClick : undefined}
                    className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg transition w-1/3 text-center h-20 ${!uploadedFile ? 'border-gray-400 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700' : 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-gray-700 cursor-default'}`}
                >
                    {uploadedFile ? (
                        <div className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-300">
                            <LuFileSpreadsheet className="w-8 h-8 mb-1 text-green-600 dark:text-green-400" />
                            <span className="font-medium truncate max-w-[90%]">{uploadedFile.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">{formatFileSize(uploadedFile.size)}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-sm text-gray-500 dark:text-gray-400">
                            <FiUploadCloud className="w-10 h-10 mb-1" />
                            <span>Upload CSV</span>
                        </div>
                    )}
                </div>
                <div className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900/80 h-20 overflow-y-auto">
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                        {promptText || <span className="text-gray-400 dark:text-gray-500 italic">Analysis prompt from main chat window will appear here...</span>}
                    </p>
                </div>
            </div>

            <MindCanvasContent
                canvasText={canvasInputText}
                isEditing={isEditing}
                copiedBlockIndex={copiedBlockIndex}
                onCanvasTextChange={setCanvasInputText}
                onCodeCopy={handleCodeCopy}
            />
        </div>
    );
};

export default MindCanvasSidebar;
