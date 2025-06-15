import { useState, useEffect } from 'react';

/**
 * A custom hook that tracks whether a media query is met.
 * @param query The media query string (e.g., '(min-width: 768px)').
 * @returns `true` if the query is met, `false` otherwise.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Ensure window is defined (for SSR)
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    
    // Set initial state
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Add listener for changes
    const listener = () => {
      setMatches(media.matches);
    };
    
    // Use addEventListener for modern browsers
    media.addEventListener('change', listener);
    
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [matches, query]);

  return matches;
};
