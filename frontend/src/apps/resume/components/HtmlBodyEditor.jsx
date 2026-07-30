import { useRef, useState } from 'react';
import { Heading2, Bold, Italic, List, ListOrdered, Code, Link2, Quote } from 'lucide-react';

function softRenderPreview(html) {
  if (!html) return '<p style="color:#9ca3af;">Nothing to preview yet.</p>';
  return html
    .replace(/\{\{#each\s+[^}]+\}\}/g, '')
    .replace(/\{\{\/each\}\}/g, '')
    .replace(/\{\{#if\s+[^}]+\}\}/g, '')
    .replace(/\{\{\/if\}\}/g, '')
    .replace(/\{\{\{?\s*([\w.]+)\s*\}?\}\}/g, (_, name) =>
      `<span style="background:#fef3c7;color:#92400e;padding:0 4px;border-radius:3px;font-size:0.85em;">${name}</span>`);
}

function wrapSelection(textarea, before, after, placeholder = '') {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const selected = value.slice(s, e) || placeholder;
  const newValue = value.slice(0, s) + before + selected + after + value.slice(e);
  return { newValue, selStart: s + before.length, selEnd: s + before.length + selected.length };
}

function wrapList(textarea, ordered) {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const selected = value.slice(s, e) || 'List item';
  const lines = selected.split('\n').filter(l => l.trim() !== '');
  const tag = ordered ? 'ol' : 'ul';
  const inner = lines.map(l => `  <li>${l}</li>`).join('\n');
  const wrapped = `<${tag}>\n${inner}\n</${tag}>`;
  const newValue = value.slice(0, s) + wrapped + value.slice(e);
  return { newValue, selStart: s, selEnd: s + wrapped.length };
}

export default function HtmlBodyEditor({ value, onChange, rows = 10 }) {
  const [tab, setTab] = useState('write');
  const textareaRef = useRef(null);

  const apply = (fn) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { newValue, selStart, selEnd } = fn(textarea);
    onChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selStart, selEnd);
    });
  };

  const actions = [
    { icon: Heading2, title: 'Heading', onClick: () => apply(t => wrapSelection(t, '<h2>', '</h2>', 'Heading')) },
    { icon: Bold, title: 'Bold', onClick: () => apply(t => wrapSelection(t, '<strong>', '</strong>', 'bold text')) },
    { icon: Italic, title: 'Italic', onClick: () => apply(t => wrapSelection(t, '<em>', '</em>', 'italic text')) },
    { icon: Quote, title: 'Quote', onClick: () => apply(t => wrapSelection(t, '<blockquote>', '</blockquote>', 'Quote')) },
    { icon: Code, title: 'Code', onClick: () => apply(t => wrapSelection(t, '<code>', '</code>', 'code')) },
    {
      icon: Link2, title: 'Link', onClick: () => apply(t => {
        const url = window.prompt('Link URL', 'https://');
        if (!url) return { newValue: t.value, selStart: t.selectionStart, selEnd: t.selectionEnd };
        return wrapSelection(t, `<a href="${url}">`, '</a>', 'link text');
      }),
    },
    { icon: List, title: 'Bulleted list', onClick: () => apply(t => wrapList(t, false)) },
    { icon: ListOrdered, title: 'Numbered list', onClick: () => apply(t => wrapList(t, true)) },
  ];

  return (
    <div className="border-2 border-ink dark:border-white/60 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-1 bg-paper border-b-2 border-ink dark:border-white/60 px-2">
        <div className="flex">
          <button type="button" onClick={() => setTab('write')}
            className={`px-3 py-1.5 text-sm font-bold border-b-2 -mb-px ${tab === 'write' ? 'border-accent text-ink dark:text-white' : 'border-transparent text-ink/50 dark:text-white/50'}`}>
            Write
          </button>
          <button type="button" onClick={() => setTab('preview')}
            className={`px-3 py-1.5 text-sm font-bold border-b-2 -mb-px ${tab === 'preview' ? 'border-accent text-ink dark:text-white' : 'border-transparent text-ink/50 dark:text-white/50'}`}>
            Preview
          </button>
        </div>
        {tab === 'write' && (
          <div className="flex flex-wrap items-center gap-0.5 py-1">
            {actions.map(({ icon: Icon, title, onClick }) => (
              <button key={title} type="button" title={title} onClick={onClick}
                className="p-1.5 rounded hover:bg-ink/10 dark:hover:bg-white/10 text-ink/70 dark:text-white/70">
                <Icon size={15} />
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'write' ? (
        <textarea
          ref={textareaRef}
          className="w-full px-3 py-2 text-sm font-mono focus:outline-none bg-paper text-ink dark:text-white"
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <div
          className="px-3 py-2 text-sm bg-paper text-ink dark:text-white min-h-[160px]
            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2
            [&_p]:mb-2 [&_strong]:font-semibold [&_em]:italic
            [&_a]:text-accent [&_a]:underline [&_code]:bg-ink/10 [&_code]:dark:bg-white/10 [&_code]:px-1 [&_code]:rounded
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
            [&_blockquote]:border-l-4 [&_blockquote]:border-ink/30 [&_blockquote]:dark:border-white/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-ink/70 [&_blockquote]:dark:text-white/70"
          style={{ minHeight: `${rows * 1.5}em` }}
          dangerouslySetInnerHTML={{ __html: softRenderPreview(value) }}
        />
      )}
    </div>
  );
}
