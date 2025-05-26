import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LuGlobe } from "react-icons/lu";
import styles from './SearchResults.module.css';
import MindBotZustand from "@/utils/mindbot-zustand";


interface SearchResult {
  title: string;
  websiteName: string;
  websiteURL: string;
  favicon: string;
}

interface SearchResultsProps {
  prompt: string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({ prompt }) => {
  const { activeSearchMode } = MindBotZustand();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [activeGlobeIndex, setActiveGlobeIndex] = useState<number | null>(null); // Track active globe

  useEffect(() => {
    const fetchImages = async () => {
      if (!prompt) {
        setImageUrls([]);
        return;
      }

      try {
        const apiKey = process.env.NEXT_PUBLIC_SERPER_API_KEY;
        const serperUrl = 'https://google.serper.dev/images';

        const response = await axios.post(
          serperUrl,
          { q: prompt, num: 11 }, // Fetch 10 images
          {
            headers: {
              'X-API-KEY': apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        const images = response.data.images || [];
        const imageUrls = images.map((image: any) => image.imageUrl);
        setImageUrls(imageUrls);
      } catch (error: any) {
        console.error('Error fetching images:', error.message);
        setImageUrls([]);
      }
    };

    fetchImages();
  }, [prompt]);

  useEffect(() => {
    const fetchData = async () => {
      if (!prompt) return;

      setLoading(true);
      setShowResults(false); // Hide results until data is fetched

      try {
        const apiKey = process.env.NEXT_PUBLIC_SERPER_API_KEY;
        const serperUrl = 'https://google.serper.dev/search';

        const response = await axios.post(
          serperUrl,
          { q: prompt },
          {
            headers: {
              'X-API-KEY': apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        const results = response.data.organic || [];

        const sources = results.slice(0, 10).map((result: any) => {
          const url = new URL(result.link);
          const websiteName = url.hostname.replace(/^www\./, '').replace(/\.com$/, '');

          return {
            title: result.title,
            websiteName: websiteName,
            websiteURL: result.link,
            favicon: `https://www.google.com/s2/favicons?sz=64&domain_url=${result.link}`,
          };
        });

        setSearchResults(sources);
        setShowResults(true); // Show results after data is fetched
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [prompt]);

  const Separator = () => (
    <hr className="w-2/3 mx-auto border-none h-0 before:block before:absolute before:-inset-1 before:bg-gradient-to-r before:from-gray-400 before:via-white before:to-gray-400 before:h-0.5" />
  );

  return (
    <div className="p-4">
      {prompt && (
        <>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-black dark:text-white inline-block">
              {activeSearchMode === "deepsearch"
                ? "DeepSearch Results"
                : activeSearchMode === "mindsearch"
                ? "MindSearch Results"
                : (
                  <div style={{ textAlign: 'center' }}>
                    No Search Results!
                  </div>
                )}
            </h3>
          </div>
          <Separator />
        </>
      )}
      {(activeSearchMode === "deepsearch" || activeSearchMode === "mindsearch") && (
        <div className={`space-y-4 overflow-y-auto max-h-[500px] ${showResults ? 'block' : 'hidden'}`}>
          {searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-md transition duration-300 hover:shadow-lg">
                <div className="flex items-center mb-2">
                  <img src={result.favicon} alt="Favicon" className="w-5 h-5 rounded-full mr-2" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{result.websiteName}</span>
                </div>
                <a href={result.websiteURL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between">
                  <h4 className="text-md font-semibold text-blue-500 hover:underline">{result.title}</h4>
                  <img
                    src={imageUrls[index] || ''}
                    alt={`Search Image ${index + 1}`}
                    className={styles.serperImage}
                  />
                </a>
                <div className="flex items-center mt-2">
                  <a
                    href={result.websiteURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center rounded-md p-2 text-black dark:text-white hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors duration-200"
                    style={{ backgroundColor: 'initial' }}
                    onMouseEnter={() => setActiveGlobeIndex(index)}
                    onMouseLeave={() => setActiveGlobeIndex(null)}
                    onClick={() => setActiveGlobeIndex(index)}
                  >
                    <LuGlobe className={`w-5 h-5 mr-1 ${activeGlobeIndex === index ? 'text-blue-500' : ''}`} />
                    <span className="text-sm">Visit</span>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'red' }}>
              No Sources Yet!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
