import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { BlogPost as BlogPostType } from "../interfaces/blog.interface";
import { Calendar, User, Clock, Tag, ChevronLeft, Heart, Share2 } from "lucide-react";
import { blogService } from "../components/service/blogService";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Mirror the Header's scroll threshold so offsets stay in sync
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await blogService.getPostBySlug(slug);
        if (cancelled) return;
        setPost(data);

        const related = await blogService.getRelatedPosts(data.id, 3);
        if (!cancelled) setRelatedPosts(related);
      } catch (error) {
        console.error("Error loading post:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPost();
    return () => { cancelled = true; };
  }, [slug]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const readTime = (content: string) => Math.max(1, Math.ceil(content.length / 1000));

  // top-bar (~40px) collapses on scroll; main header is always ~72px
  const topPad = scrolled ? "pt-[72px]" : "pt-[112px]";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-5xl mb-4">📭</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Post Not Found</h1>
          <Link to="/blog" className="text-purple-600 font-semibold hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero banner ── */}
      <div
        className={`relative overflow-hidden bg-white pb-10 transition-[padding-top] duration-300 ${topPad}`}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 pt-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors mb-6"
          >
            <ChevronLeft size={16} />
            Back to Blog
          </Link>

          {post.category_name && (
            <Link
              to={`/blog?category=${post.category_slug}`}
              className="inline-block text-xs font-serif font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full mb-4"
            >
              {post.category_name}
            </Link>
          )}

          <h1 className="text-3xl font-serif md:text-5xl font-black text-purple-900 leading-tight mb-5">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-purple-700 font-bold max-w-2xl mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-purple-400" />
              {formatDate(post.published_at || post.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={14} className="text-purple-400" />
              {post.author_name}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-purple-400" />
              {readTime(post.content)} min read
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Featured Image */}
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full rounded-2xl shadow-md mb-8 object-cover max-h-[480px]"
          />
        )}

        {/* Article content */}
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100">
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-purple-900 prose-headings:font-black
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-a:text-purple-600 prose-a:font-semibold hover:prose-a:text-purple-800
              prose-strong:text-gray-800
              prose-code:text-orange-600 prose-code:bg-orange-50 prose-code:px-1 prose-code:rounded
              prose-blockquote:border-purple-400 prose-blockquote:text-purple-700"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-10 pt-6 border-t border-gray-100 flex-wrap">
              <Tag size={14} className="text-gray-400 flex-shrink-0" />
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/blog?tag=${tag.slug}`}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-purple-50 hover:text-purple-700 transition font-medium"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
            <button className="flex items-center gap-2 px-5 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-bold hover:bg-purple-100 transition">
              <Heart size={15} />
              Like
            </button>
            <button
              onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
              className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-200 transition"
            >
              <Share2 size={15} />
              Share
            </button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-14">
            <h3 className="text-2xl font-black text-purple-900 mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-5">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  {related.featured_image && (
                    <div className="h-36 overflow-hidden">
                      <img
                        src={related.featured_image}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {related.category_name && (
                      <span className="text-xs font-bold text-orange-500 mb-1 block">
                        {related.category_name}
                      </span>
                    )}
                    <h4 className="font-bold text-gray-800 line-clamp-2 group-hover:text-purple-700 transition-colors leading-snug mb-1">
                      {related.title}
                    </h4>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(related.published_at || related.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPost;