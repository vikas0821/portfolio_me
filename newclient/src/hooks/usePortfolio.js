import { useEffect, useState } from "react";
import { fetchPortfolio } from "../api/portfolioService";
import { applyAccent } from "../lib/accent";

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

const usePortfolio = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolio()
      .then((result) => {
        if (result) {
          setData(result);
          if (result.settings) {
            applyAccent(result.settings.accentColor);
            applySeo(result.settings.seo);
          }
        } else setError("Failed to load portfolio data");
      })
      .catch(() => setError("Failed to load portfolio"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

export default usePortfolio;
