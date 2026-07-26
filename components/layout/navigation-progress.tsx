"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BrandLoader } from "@/components/ui/loading";
import { NAV_LOADING_EVENT } from "@/lib/navigation-loading";

/**
 * Immediate top progress bar + brand overlay on internal navigations.
 * Complements route-level loading.tsx (which only appears after the RSC request starts).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;
  const activeRoute = useRef(routeKey);

  function clearTimers() {
    for (const id of timers.current) clearTimeout(id);
    timers.current = [];
  }

  function start() {
    clearTimers();
    setVisible(true);
    setProgress(12);
    timers.current.push(setTimeout(() => setProgress(42), 120));
    timers.current.push(setTimeout(() => setProgress(68), 400));
    timers.current.push(setTimeout(() => setProgress(82), 1200));
  }

  function finish() {
    clearTimers();
    setProgress(100);
    timers.current.push(
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 220),
    );
  }

  useEffect(() => {
    if (activeRoute.current !== routeKey) {
      activeRoute.current = routeKey;
      finish();
    }
  }, [routeKey]);

  useEffect(() => {
    function onNavSignal() {
      start();
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      const nextKey = `${url.pathname}?${url.searchParams.toString()}`;
      const currentKey = `${window.location.pathname}?${window.location.search.slice(1)}`;
      if (nextKey === currentKey) return;

      start();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener(NAV_LOADING_EVENT, onNavSignal);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(NAV_LOADING_EVENT, onNavSignal);
      clearTimers();
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-transparent"
      >
        <div
          className="h-full bg-[var(--primary)] shadow-[0_0_8px_rgba(0,86,210,0.45)] transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        role="status"
        aria-live="polite"
        aria-label="Loading page"
        className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--background)]/85 backdrop-blur-[2px]"
      >
        <BrandLoader label="Loading" />
      </div>
    </>
  );
}
