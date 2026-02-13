import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest updates, guides, and insights from the {{PRODUCT_NAME}} team.",
};

export default function BlogPage() {
  return (
    <div className="container-narrow py-24">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Blog
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Latest updates, guides, and insights.
        </p>
      </div>

      {/* Blog posts grid - populate from CMS or MDX */}
      <div className="mt-16 grid gap-8 sm:grid-cols-2">
        {/* Placeholder posts */}
        {[1, 2, 3, 4].map((i) => (
          <article
            key={i}
            className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="aspect-video rounded-lg bg-gray-100 dark:bg-gray-800" />
            <div className="mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Jan {i}, 2025 · 5 min read
              </p>
              <h2 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                Blog Post Title {i}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                A brief description of this blog post that gives readers a preview of what to expect.
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
