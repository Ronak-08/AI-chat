<script>
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { mount, unmount } from 'svelte';
import { Copy, Check } from 'lucide-svelte';

let { content } = $props();


const renderer = new marked.Renderer();

renderer.table = (token) => {
  const header = renderer.tablerow(token.header);
  const body = token.rows.map(row => renderer.tablerow(row)).join('');

  return `<div class="my-6 w-full overflow-y-auto rounded-lg border border-border">
<table class="w-full text-sm">
<thead class="bg-muted/50 [&_tr]:border-b">${header}</thead>
<tbody class="[&_tr:last-child]:border-0">${body}</tbody>
</table>
</div>`;
};

renderer.tablerow = (cells) => {
  const content = cells.map(cell => renderer.tablecell(cell)).join('');
  return `<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">${content}</tr>`;
};

renderer.tablecell = (token) => {
  const tag = token.header ? 'th' : 'td';
  const classes = token.header 
    ? "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
    : "p-4 align-middle [&:has([role=checkbox])]:pr-0";
  const text = token.tokens ? marked.parseInline(token.tokens.map(t => t.raw).join('')) : token.text;
  return `<${tag} class="${classes}">${text}</${tag}>`;
};

marked.use({ renderer });

let html = $derived(DOMPurify.sanitize(marked.parse(content || '')));
</script>

<div 
  class="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed wrap-break-word whitespace-pre-wrap w-full min-w-0"
  >
  {@html html}
</div>
