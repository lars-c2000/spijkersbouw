import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function EditArtikelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <BlogPostForm
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        content: post.content,
        category: post.category,
        published: post.published,
      }}
    />
  );
}
