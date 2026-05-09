import React, { useState, useEffect } from "react";
import CreatePost from "../../components/community/CreatePost";
import PostCard from "../../components/community/PostCard";
import communityService from "../../services/communityService";
import { Loader2, Users } from "lucide-react";
import toast from "react-hot-toast";
import EmptyState from "../../components/common/EmptyState";

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'my', 'liked'

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await communityService.getPosts(filter);
      if (res.success) {
        setPosts(res.data);
      }
    } catch (err) {
      toast.error("Failed to load community posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filter]);

  const handlePostCreated = (newPost) => {
    if (filter === "all" || filter === "my") {
      setPosts([newPost, ...posts]);
    }
  };

  const getEmptyStateMessage = () => {
    switch (filter) {
      case "my":
        return "You haven't posted anything yet.";
      case "liked":
        return "You haven't liked any posts.";
      case "reposts":
        return "You haven't reposted any posts yet.";
      default:
        return "No posts yet. Be the first to share something!";
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 page-enter">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Community Feed</h1>
        <p className="text-neutral-400">Join the discussion, share updates, and explore.</p>
      </div>

      <CreatePost onPostCreated={handlePostCreated} />

      {/* Filters */}
      <div className="flex bg-neutral-900 rounded-xl p-1.5 mb-8 border border-neutral-800">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            filter === "all" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("my")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            filter === "my" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          My Posts
        </button>
        <button
          onClick={() => setFilter("liked")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            filter === "liked" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Liked
        </button>
        <button
          onClick={() => setFilter("reposts")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            filter === "reposts" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Reposts
        </button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="It's a bit quiet here"
            description={getEmptyStateMessage()}
          />
        ) : (
          posts.map((post) => (
            <PostCard 
               key={post._id} 
               post={post} 
               onPostDeleted={(postId) => setPosts(posts.filter(p => p._id !== postId))}
               onPostUpdated={(updatedPost) => setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p))}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
