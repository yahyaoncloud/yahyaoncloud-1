import { useLocation, useFetcher } from "@remix-run/react";
import { useEffect } from "react";

export function Tracker() {
  const location = useLocation();
  const fetcher = useFetcher();

  useEffect(() => {
    if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/api") || location.pathname.startsWith("/auth")) {
      return;
    }

    const data = {
      path: location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    };

    fetcher.submit(data, {
      method: "post",
      action: "/api/track",
      encType: "application/json",
    });
  }, [location.pathname]);

  return null;
}
