export function parseFrontmatter(raw: string): {
  meta: Record<string, any>;
  content: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const meta: Record<string, any> = {};
  let currentKey = "";
  let inArray = false;

  for (const line of match[1].split("\n")) {
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      if (value === "") {
        meta[key] = [];
        currentKey = key;
        inArray = true;
      } else {
        meta[key] = value.replace(/^["']|["']$/g, "");
        inArray = false;
      }
    } else if (inArray && line.match(/^\s+-\s+/)) {
      const val = line.replace(/^\s+-\s+/, "").replace(/^["']|["']$/g, "");
      meta[currentKey].push(val);
    }
  }

  return { meta, content: match[2] };
}

export function extractWikilinks(text: string): string[] {
  const links = new Set<string>();
  const re = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const target = m[1].split("|")[0].trim();
    links.add(target.toLowerCase().replace(/\s+/g, "-"));
  }
  return [...links];
}
