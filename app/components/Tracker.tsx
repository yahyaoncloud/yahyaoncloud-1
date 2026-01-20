import { useLocation, useFetcher } from "@remix-run/react";
import { useEffect } from "react";

export function Tracker() {
  const location = useLocation();
  const fetcher = useFetcher();

  useEffect(() => {
    // Basic client-side info gathering
    const data = {
      path: location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      // Minimal fingerprinting or just UA parsing could happen here or server side
      // For simplicity sending raw basic data
    };

    // Use fetcher to submit without navigation
    fetcher.submit(data, {
      method: "post",
      action: "/api/track",
      encType: "application/json",
    });
  }, [location.pathname]); // Trigger on path change

  return null;
}
