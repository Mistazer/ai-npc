import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { Breadcrumbs } from "@/components/ui";
import { GAMES } from "@/lib/games";
import { NEWS, getNews } from "@/content/news";

export function generateStaticParams() {
  return NEWS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getNews(slug);
  if (!item) return {};
  return { title: item.title, description: item.excerpt };
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getNews(slug);
  if (!item) notFound();

  const game = item.game === "all" ? null : GAMES[item.game];
  const html = await marked.parse(item.body);

  return (
    <div className="mx-auto max-w-[760px] px-4 py-8">
      <Breadcrumbs items={[{ label: "Actualités", href: "/actualites" }, { label: item.title }]} />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="chip">{item.category}</span>
        {game ? (
          <span className="chip" style={{ borderColor: game.accent, color: game.accent }}>
            {game.name}
          </span>
        ) : null}
        <span className="text-[0.72rem] text-[var(--muted-dim)]">
          {new Date(item.date).toLocaleDateString("fr-FR", { dateStyle: "long" })}
        </span>
      </div>

      <h1 className="mb-4 text-2xl font-black leading-tight tracking-tight sm:text-3xl">{item.title}</h1>

      <article className="prose-game" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
