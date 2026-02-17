/**
 * Lightweight Markdown-to-HTML renderer.
 * Handles the most common Markdown constructs.
 */
export function renderMarkdown(md: string): string {
  if (!md) return '';

  let html = md;

  // Convert literal \n strings to actual newlines (from JSON/DB storage)
  html = html.replace(/\\n/g, '\n');

  // Escape HTML entities (but preserve intentional tags later)
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Code blocks (fenced ``` … ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="bg-neutral-900 border border-neutral-800 rounded-lg p-4 overflow-x-auto my-6"><code class="text-sm text-gray-300 font-mono">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-neutral-800 text-red-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // Images  ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-6 w-full" loading="lazy" />');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-red-dot hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-display font-semibold text-white mt-8 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-display font-bold text-white mt-10 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-display font-bold text-white mt-10 mb-4">$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-neutral-800 my-8" />');

  // Bold & Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="text-white"><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-2 border-red-dot pl-4 my-4 text-gray-400 italic">$1</blockquote>');

  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="text-gray-300 ml-4 list-disc">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="my-4 space-y-1">${match}</ul>`);

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="text-gray-300 ml-4 list-decimal">$1</li>');

  // Paragraphs: wrap remaining lines
  html = html.replace(/^(?!<[a-zA-Z])((?!^\s*$).+)$/gm, '<p class="text-gray-400 leading-relaxed mb-4">$1</p>');

  // Clean up extra blank lines
  html = html.replace(/\n{3,}/g, '\n\n');

  return html;
}
