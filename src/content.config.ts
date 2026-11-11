import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string().default("ai"),
    categoryLabel: z.string().optional(),
    project: z.string().optional(),
    eyebrow: z.string().optional(),
    readTime: z.string().default("4 min read"),
    prUrl: z.string().optional(),
    order: z.number().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog,
};
