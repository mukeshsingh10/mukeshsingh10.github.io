import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { siteConfig } from "../site.config";

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog");
  const sorted = [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const items = sorted
    .map(
      (post) => `  <entry>
    <title type="html">${escapeXml(post.data.title)}</title>
    <link href="${siteConfig.url}/notes/${post.id}/" rel="alternate" type="text/html" title="${escapeXml(post.data.title)}" />
    <published>${post.data.pubDate.toISOString()}</published>
    <updated>${post.data.pubDate.toISOString()}</updated>
    <id>${siteConfig.url}/notes/${post.id}</id>
    <summary type="html">${escapeXml(post.data.description)}</summary>
  </entry>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <generator uri="https://astro.build/">Astro</generator>
  <link href="${siteConfig.url}/feed.xml" rel="self" type="application/atom+xml" />
  <link href="${siteConfig.url}/" rel="alternate" type="text/html" />
  <updated>${new Date().toISOString()}</updated>
  <id>${siteConfig.url}/feed.xml</id>
  <title type="html">${escapeXml(siteConfig.siteName)}</title>
  <subtitle>${escapeXml(siteConfig.description)}</subtitle>
  <author><name>${escapeXml(siteConfig.username)}</name></author>
${items}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
};

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

