"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    let timer: NodeJS.Timeout;
    
    if (media.matches !== matches) {
      timer = setTimeout(() => setMatches(media.matches), 0);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => {
      if (timer) clearTimeout(timer);
      media.removeEventListener("change", listener);
    };
  }, [matches, query]);

  return matches;
}
