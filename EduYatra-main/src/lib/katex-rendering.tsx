import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import React from 'react';

type LatexContent = string | undefined | null;

/**
 * Checks if content is likely LaTeX (basic heuristic)
 * @param content The text to check
 * @returns True if content resembles LaTeX
 */
const isLatexLike = (content: string): boolean => {
  // Basic heuristic: look for common LaTeX patterns (e.g., \, ^, _, or commands)
  return /\\[a-zA-Z]+|\^|_|\{|\}/.test(content);
};

/**
 * Renders text with LaTeX expressions
 * @param content The text content to render
 * @param isInline Whether to force inline rendering
 * @param isRawLatex Whether the content is raw LaTeX (no delimiters)
 * @returns React nodes with rendered LaTeX
 */
export const renderKatex = (
  content: LatexContent,
  isInline = false,
  isRawLatex = false
): React.ReactNode => {
  if (!content) return null;

  // If marked as raw LaTeX, render directly as math
  if (isRawLatex) {
    return isInline ? <InlineMath math={content} /> : <BlockMath math={content} />;
  }

  // If content looks like LaTeX and has no delimiters, treat as raw LaTeX
  if (isLatexLike(content) && !/\$\$.*?\$\$|\$.*?\$/.test(content)) {
    return isInline ? <InlineMath math={content} /> : <BlockMath math={content} />;
  }

  // Otherwise, split and process delimiters as before
  return content.split(/(\$\$.*?\$\$|\$.*?\$)/).map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$') && !isInline) {
      return <BlockMath key={i} math={part.slice(2, -2)} />;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      return <InlineMath key={i} math={part.slice(1, -1)} />;
    }
    return <span key={i}>{part}</span>;
  });
};

/**
 * React component for LaTeX rendering with error boundary
 */
export const KatexRenderer = ({
  children,
  isInline = false,
  isRawLatex = false,
}: {
  children: LatexContent;
  isInline?: boolean;
  isRawLatex?: boolean;
}) => {
  try {
    return <>{renderKatex(children, isInline, isRawLatex)}</>;
  } catch (error) {
    console.error('Katex rendering error:', error);
    return <span className="text-red-500">{children}</span>;
  }
};

/**
 * Checks if text contains LaTeX expressions
 */
export const hasKatex = (content: LatexContent): boolean => {
  return !!content && (/\$(.*?)\$/.test(content) || isLatexLike(content));
};