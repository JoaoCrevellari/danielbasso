import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { urlSegura } from "@/lib/url-segura";
import { cn } from "@/lib/utils";

/** Texto em markdown vindo do painel. HTML cru é ignorado; links passam por urlSegura. */
export function Markdown({
  children,
  className,
}: {
  children?: string | null;
  className?: string;
}) {
  if (!children) return null;
  return (
    <div className={cn("prosa", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        urlTransform={(url) => urlSegura(url) ?? (url.startsWith("mailto:") ? url : "")}
        components={{
          a: ({ href, children: filhos }) => {
            const externo = !!href && /^https?:\/\//.test(href);
            return (
              <a href={href} {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {filhos}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
