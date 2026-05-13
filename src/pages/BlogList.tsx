import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { BlogPost, BlogCategory } from "../interfaces/blog.interface";
import { Calendar, User, Clock, Tag, ChevronRight, Search, BookOpen, ArrowRight } from "lucide-react";
import { blogService } from "../components/service/blogService";

const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [scrolled, setScrolled] = useState(false);

  // Mirror the same threshold the Header uses so offsets stay in sync
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentCategory = searchParams.get("category") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [catData, postResponse] = await Promise.all([
          blogService.getCategories(),
          blogService.getPosts({
            page: currentPage,
            category: currentCategory || undefined,
            tag: currentTag || undefined,
            search: currentSearch || undefined,
          }),
        ]);

        if (!ignore) {
          setCategories(catData);
          setPosts(postResponse.posts);
          setPagination(postResponse.pagination);
        }
      } catch (error) {
        if (!ignore) console.error("Error loading blog data:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();
    return () => { ignore = true; };
  }, [currentPage, currentCategory, currentTag, currentSearch]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const readTime = (content: string) => Math.max(1, Math.ceil(content.length / 1000));

  // top-bar (~40px) collapses on scroll; main header is always ~72px tall
  const heroTopPad  = scrolled ? "pt-[72px]"  : "pt-[112px]";
  const stickyTop   = scrolled ? "top-[72px]" : "top-[112px]";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section
  className={`relative overflow-hidden bg-white pb-16 transition-[padding-top] duration-300 ${heroTopPad}`}
>
  <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
  <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-purple-500/30 blur-2xl pointer-events-none" />

  <div className="relative max-w-6xl mx-auto px-4 text-center">
    <span className="inline-block font-serif text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-4">
      AkiliCode · Blog
    </span>
    <h1 className="text-5xl md:text-6xl font-serif font-black text-purple-900 leading-tight mb-4">
      Ideas Worth <span className="text-orange-500">Reading</span>
    </h1>
    <p className="text-purple-700 font-serif text-lg max-w-xl mx-auto">
      Coding tips, parenting insights, and stories straight from our community.
    </p>

    <div className="mt-8 max-w-lg mx-auto relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        placeholder="Search articles..."
        value={currentSearch}
        onChange={(e) =>
          setSearchParams({
            ...Object.fromEntries(searchParams),
            search: e.target.value,
            page: "1",
          })
        }
        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white text-gray-800 placeholder-gray-400 text-sm shadow-xl outline-none focus:ring-2 focus:ring-orange-400 border border-purple-100"
      />
    </div>
  </div>
</section>

      {/* ── Category pills ── */}
      <div
        className={`sticky ${stickyTop} z-30 bg-white border-b border-gray-100 shadow-sm transition-[top] duration-300`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Link
            to="/blog"
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              !currentCategory
                ? "bg-purple-700 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700"
            }`}
          >
            All Posts
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/blog?category=${cat.slug}`}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                currentCategory === cat.slug
                  ? "bg-purple-700 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700"
              }`}
            >
              {cat.name}
              {cat.post_count !== undefined && (
                <span className="ml-1.5 text-xs opacity-60">({cat.post_count})</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-10">

          {/* ── Main feed ── */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-32">
                <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-gray-100">
                <BookOpen size={48} className="text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium">No posts found.</p>
                <Link to="/blog" className="mt-3 text-sm text-purple-600 font-semibold hover:underline">
                  Clear filters
                </Link>
              </div>
            ) : (
              <>
                {/* Featured first post */}
                {posts[0] && (
                  <article className="group mb-8 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                    {posts[0].featured_image && (
                      <div className="h-64 md:h-80 overflow-hidden">
                        <img
                          src={posts[0].featured_image}
                          alt={posts[0].title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-7">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3">
                        {posts[0].category_name && (
                          <Link
                            to={`/blog?category=${posts[0].category_slug}`}
                            className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full"
                          >
                            {posts[0].category_name}
                          </Link>
                        )}
                        <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(posts[0].published_at || posts[0].created_at)}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{readTime(posts[0].content)} min read</span>
                        <span className="flex items-center gap-1"><User size={12} />{posts[0].author_name}</span>
                      </div>
                      <Link to={`/blog/${posts[0].slug}`}>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 group-hover:text-purple-700 transition-colors leading-snug">
                          {posts[0].title}
                        </h2>
                      </Link>
                      {posts[0].excerpt && (
                        <p className="text-gray-500 leading-relaxed mb-5">{posts[0].excerpt}</p>
                      )}
                      <Link
                        to={`/blog/${posts[0].slug}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 px-5 py-2.5 rounded-full transition-all"
                      >
                        Read Article <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                )}

                {/* Rest of posts in a 2-col grid */}
                {posts.length > 1 && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {posts.slice(1).map((post) => (
                      <article
                        key={post.id}
                        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
                      >
                        {post.featured_image && (
                          <div className="h-44 overflow-hidden">
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                            {post.category_name && (
                              <span className="text-orange-500 font-semibold">{post.category_name}</span>
                            )}
                            <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(post.published_at || post.created_at)}</span>
                            <span className="flex items-center gap-1"><Clock size={11} />{readTime(post.content)} min</span>
                          </div>

                          <Link to={`/blog/${post.slug}`}>
                            <h2 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors leading-snug line-clamp-2">
                              {post.title}
                            </h2>
                          </Link>

                          {post.excerpt && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
                          )}

                          <Link
                            to={`/blog/${post.slug}`}
                            className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:gap-2 transition-all"
                          >
                            Read More <ChevronRight size={14} />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-12">
                    <button
                      onClick={() =>
                        setSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: String(Math.max(1, currentPage - 1)),
                        })
                      }
                      disabled={currentPage === 1}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
                    >
                      ← Previous
                    </button>
                    <span className="text-sm text-gray-500 font-medium">
                      {currentPage} / {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        setSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: String(Math.min(pagination.pages, currentPage + 1)),
                        })
                      }
                      disabled={currentPage === pagination.pages}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-1 space-y-6">

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2">About This Blog</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Tips, guides, and stories to help parents and kids thrive in the world of code.
              </p>
            </div>

            {posts.flatMap(p => p.tags || []).length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Tag size={14} className="text-purple-600" /> Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(posts.flatMap(p => p.tags?.map(t => t.name) || []))].slice(0, 12).map(tag => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${tag}`}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                        currentTag === tag
                          ? "bg-purple-700 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-purple-900 rounded-2xl p-5 text-white">
              <div className="text-2xl mb-2">✉️</div>
              <h3 className="font-bold text-lg mb-1">Stay in the loop</h3>
              <p className="text-sm text-purple-200 mb-4 leading-relaxed">
                Get the latest posts and coding resources straight to your inbox.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 text-sm mb-3 outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all">
                Subscribe
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogList;