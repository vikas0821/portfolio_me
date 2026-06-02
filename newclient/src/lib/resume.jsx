// Client-side resume PDF generation from live portfolio data.
// @react-pdf/renderer is dynamically imported so it doesn't bloat the main bundle.
import { buildResumeDocument } from "./resumeDoc.mjs";

export async function downloadResumePdf(data) {
  const [React, RP] = await Promise.all([import("react"), import("@react-pdf/renderer")]);
  const ReactDefault = React.default || React;
  const element = buildResumeDocument({ React: ReactDefault, RP, data });
  const blob = await RP.pdf(element).toBlob();

  const name = (data?.hero?.name || "Resume").replace(/\s+/g, "_");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}_Resume.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
