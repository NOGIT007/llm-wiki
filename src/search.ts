import type { WikiPage } from "./types";

export function buildGraphData(pages: Map<string, WikiPage>) {
  const nodes: { id: string; title: string; type: string; links: number }[] = [];
  const edges: { source: string; target: string }[] = [];
  const slugs = new Set(pages.keys());

  for (const [slug, page] of pages) {
    nodes.push({
      id: slug,
      title: page.title,
      type: page.type,
      links: page.links.length,
    });
    for (const link of page.links) {
      if (slugs.has(link) && link !== slug) {
        edges.push({ source: slug, target: link });
      }
    }
  }

  return { nodes, edges };
}

export function searchPages(query: string, pages: Map<string, WikiPage>) {
  const q = query.toLowerCase();
  const results: { slug: string; title: string; type: string; score: number }[] = [];

  for (const [slug, page] of pages) {
    let score = 0;
    if (page.title.toLowerCase().includes(q)) score += 10;
    if (slug.includes(q)) score += 5;
    if (page.tags.some((t) => t.includes(q))) score += 3;
    if (page.content.toLowerCase().includes(q)) score += 1;
    if (score > 0) results.push({ slug, title: page.title, type: page.type, score });
  }

  return results.sort((a, b) => b.score - a.score);
}
