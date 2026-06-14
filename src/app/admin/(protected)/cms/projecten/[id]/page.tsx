import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <ProjectForm
      initial={{
        id: project.id,
        title: project.title,
        description: project.description ?? "",
        category: project.category,
        year: project.year,
        published: project.published,
      }}
    />
  );
}
