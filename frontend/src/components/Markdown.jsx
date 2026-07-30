import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";

// Renders Markdown with GitHub-flavored syntax + code highlighting.
// Styling lives under `.md-content` in index.css.
const Markdown = ({ children }) => (
  <div className="md-content">
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
      {children || ""}
    </ReactMarkdown>
  </div>
);

export default Markdown;
