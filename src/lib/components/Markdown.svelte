<script module>
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import DOMPurify from 'dompurify';

const options = {
  nonStandard: true, 
  throwOnError: false 
};

marked.use(markedKatex(options));
marked.use({
  breaks: true,
  gfm: true,
});
</script>

<script>
let { content } = $props();

let html = $derived(DOMPurify.sanitize(marked.parse(content || ''), {
  ADD_TAGS: ["math", "annotation", "semantics", "mn", "mo", "mi", "msup", "msub", "mfrac", "mtable", "mtr", "mtd"],
  ADD_ATTR: ["mathvariant", "display"]
}));
</script>

<div 
  class="prose px-0.5 py-2 prose-zinc dark:prose-invert max-w-none text-base leading-relaxed w-full min-w-0"
  >
  {@html html}
</div>
