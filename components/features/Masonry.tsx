"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { gsap } from "gsap";

/* ---------------------------------- */
/* Responsive media query hook (SSR-safe) */
/* ---------------------------------- */
const useMedia = (
  queries: string[],
  values: number[],
  defaultValue: number
): number => {
  const getValue = () => {
    if (typeof window === "undefined") return defaultValue;
    const index = queries.findIndex((q) => window.matchMedia(q).matches);
    return values[index] ?? defaultValue;
  };

  const [value, setValue] = useState<number>(getValue);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => setValue(getValue);
    const mqs = queries.map((q) => window.matchMedia(q));

    mqs.forEach((mq) => mq.addEventListener("change", handler));
    return () => mqs.forEach((mq) => mq.removeEventListener("change", handler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);

  return value;
};

/* ---------------------------------- */
/* Resize observer hook */
/* ---------------------------------- */
const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

/* ---------------------------------- */
/* Image preloader */
/* ---------------------------------- */
const preloadImages = async (urls: string[]) => {
  await Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */
interface Item {
  id: string;
  img: string;
  url: string;
  height: number;
}

interface GridItem extends Item {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MasonryProps {
  items: Item[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "bottom" | "top" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
}

/* ---------------------------------- */
/* Masonry Component */
/* ---------------------------------- */
const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  blurToFocus = true,
  colorShiftOnHover = false,
}) => {
  const columns = useMedia(
    [
      "(min-width:1500px)",
      "(min-width:1000px)",
      "(min-width:600px)",
      "(min-width:400px)",
    ],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [imagesReady, setImagesReady] = useState(false);
  const hasMounted = useRef(false);

  /* ---------------------------------- */
  /* Initial animation origin */
  /* ---------------------------------- */
  const getInitialPosition = useCallback(function getInitPos(item: GridItem, direction: string): { x: number, y: number } {
    if (typeof window === "undefined") return { x: item.x, y: item.y };

    switch (direction) {
      case "top":
        return { x: item.x, y: -200 };
      case "bottom":
        return { x: item.x, y: window.innerHeight + 200 };
      case "left":
        return { x: -200, y: item.y };
      case "right":
        return { x: window.innerWidth + 200, y: item.y };
      case "center":
        return { x: width / 2 - item.w / 2, y: 200 };
      case "random": {
        const dirs = ["top", "bottom", "left", "right"];
        const randDir = dirs[Math.floor(Math.random() * 4)];
        return getInitPos(item, randDir);
      }
      default:
        return { x: item.x, y: item.y };
    }
  }, [width]);

  /* ---------------------------------- */
  /* Preload images */
  /* ---------------------------------- */
  useEffect(() => {
    preloadImages(items.map((i) => i.img)).then(() => setImagesReady(true));
  }, [items]);

  /* ---------------------------------- */
  /* Build masonry grid */
  /* ---------------------------------- */
  const grid = useMemo<GridItem[]>(() => {
    if (!width) return [];

    const gap = 16;
    const colHeights = new Array(columns).fill(0);
    const columnWidth = (width - gap * (columns - 1)) / columns;

    return items.map((item) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      const h = item.height;
      const y = colHeights[col];

      colHeights[col] += h + gap;
      return { ...item, x, y, w: columnWidth, h };
    });
  }, [items, columns, width]);

  /* ---------------------------------- */
  /* 🔥 CRITICAL FIX: calculate container height */
  /* ---------------------------------- */
  const masonryHeight = useMemo(() => {
    if (!grid.length) return 0;
    return Math.max(...grid.map((i) => i.y + i.h));
  }, [grid]);

  /* ---------------------------------- */
  /* Animate */
  /* ---------------------------------- */
  useLayoutEffect(() => {
    if (!imagesReady) return;

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const end = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const start = getInitialPosition(item, animateFrom);

        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            ...(blurToFocus && { filter: "blur(10px)" }),
          },
          {
            opacity: 1,
            ...end,
            ...(blurToFocus && { filter: "blur(0px)" }),
            duration: 0.8,
            delay: index * stagger,
            ease: "power3.out",
          }
        );
      } else {
        gsap.to(selector, {
          ...end,
          duration,
          ease,
          overwrite: "auto",
        });
      }
    });

    hasMounted.current = true;
  }, [grid, imagesReady, stagger, duration, ease, blurToFocus, animateFrom, getInitialPosition]);

  /* ---------------------------------- */
  /* Render */
  /* ---------------------------------- */
  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: masonryHeight }} // 🔑 FOOTER SAFE
    >
      {grid.map((item) => (
        <div
          key={item.id}
          data-key={item.id}
          className="absolute cursor-pointer"
          onClick={() => window.open(item.url, "_blank", "noopener")}
        >
          <div
            className="w-full h-full bg-cover bg-center rounded-[10px]
                       shadow-[0_10px_50px_-10px_rgba(0,0,0,0.25)]"
            style={{
              width: item.w,
              height: item.h,
              backgroundImage: `url(${item.img})`,
            }}
          >
            {colorShiftOnHover && (
              <div
                className="absolute inset-0 rounded-[10px]
                              bg-gradient-to-tr from-pink-500/40 to-sky-500/40
                              opacity-0 hover:opacity-30 transition-opacity"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;
