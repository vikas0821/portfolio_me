import { useEffect, useState } from "react";
import { fetchPortfolio } from "../api/portfolioService";
import { applyAccent } from "../lib/accent";
import portfolioFallback from "../data/portfolioFallback";

const applySeo = (seo) => {
  if (!seo) return;
  if (seo.title) document.title = seo.title;
  if (seo.description) {
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", seo.description);
  }
};

// Renders instantly with bundled fallback content (Render's free tier sleeps
// after inactivity — the first request can take 30-60s to wake it up) while
// polling the real API in the background. As soon as live data arrives it
// silently replaces the fallback; failed attempts retry with backoff instead
// of surfacing an error, since the visitor already has a working page.
const usePortfolio = () => {
  const [data, setData] = useState(portfolioFallback);

  useEffect(() => {
    let cancelled = false;
    let timer;

    const attempt = async (delay) => {
      const result = await fetchPortfolio({ silent: true });
      if (cancelled) return;
      if (result) {
        setData(result);
        if (result.settings) {
          applyAccent(result.settings.accentColor);
          applySeo(result.settings.seo);
        }
        return;
      }
      const next = Math.min(delay * 1.5, 10000);
      timer = setTimeout(() => attempt(next), next);
    };

    attempt(2000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  return { data };
};

export default usePortfolio;
