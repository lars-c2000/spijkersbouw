import { prisma } from "@/lib/prisma";

/**
 * Fetch all CMS blocks for a page and return as key→value map.
 * Falls back to empty string if a block doesn't exist yet.
 */
export async function getCmsPage(page: string): Promise<Record<string, string>> {
  const blocks = await prisma.cmsBlock.findMany({ where: { page } });
  return Object.fromEntries(blocks.map((b) => [b.key, b.value]));
}

/** Return value or fallback if empty/missing */
export function cms(blocks: Record<string, string>, key: string, fallback = ""): string {
  return blocks[key] || fallback;
}
