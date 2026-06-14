import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } });
  if (!post) return {};
  return { title: `${post.title} | Spijkersbouw`, description: post.excerpt ?? undefined };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } });
  if (!post) notFound();

  return (
    <>
      <section className="bg-black text-white py-16 md:py-20">
        <div className="container-custom">
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
            <Link href="/blog" className="hover:text-white transition-colors">← Blog</Link>
            <span>{post.category}</span>
            <span>
              {(post.publishedAt ?? post.createdAt).toLocaleDateString("nl-NL", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">{post.title}</h1>
          {post.excerpt && <p className="text-gray-300 text-lg mt-4 max-w-2xl">{post.excerpt}</p>}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link href="/blog" className="text-black font-medium hover:underline">
                ← Terug naar blog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold mb-4">Heeft u een vraag?</h2>
          <p className="text-gray-600 mb-6">Neem contact op of vraag direct een offerte aan.</p>
          <div className="flex justify-center gap-4">
            <Link href="/contact" className="border border-black text-black px-6 py-3 font-medium hover:bg-black hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/offerte" className="bg-[#e65100] text-white px-6 py-3 font-medium hover:bg-[#bf360c] transition-colors">
              Offerte aanvragen
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
