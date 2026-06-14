import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CMS_PAGES } from "@/lib/cmsFields";
import CmsEditor from "./CmsEditor";

export default async function CmsPageEditor({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const config = CMS_PAGES[page];
  if (!config) notFound();

  // Laad bestaande waarden
  const blocks = await prisma.cmsBlock.findMany({ where: { page } });
  const values = Object.fromEntries(blocks.map((b) => [b.key, b.value]));

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <a href="/admin/cms" className="text-gray-400 hover:text-gray-600 text-sm">← CMS</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{config.title}</h1>
        <p className="text-gray-500 mt-1">{config.description}</p>
      </div>
      <CmsEditor page={page} config={config} initialValues={values} />
    </div>
  );
}
