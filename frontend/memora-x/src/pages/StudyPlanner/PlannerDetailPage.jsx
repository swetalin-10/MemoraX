import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Sparkles } from "lucide-react";
import studyPlannerService from "../../services/studyPlannerService";
import Spinner from "../../components/common/Spinner";
import RoadmapViewer from "../../components/studyPlanner/RoadmapViewer";
import PlannerChat from "../../components/studyPlanner/PlannerChat";
import toast from "react-hot-toast";

const PlannerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [planner, setPlanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchPlanner = async () => {
      try {
        const response = await studyPlannerService.getPlannerById(id);
        setPlanner(response.data);
      } catch (error) {
        toast.error("Failed to load planner details");
        navigate("/study-planner");
      } finally {
        setLoading(false);
      }
    };
    fetchPlanner();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this study planner?")) return;
    
    try {
      setIsDeleting(true);
      await studyPlannerService.deletePlanner(id);
      toast.success("Planner deleted successfully");
      navigate("/study-planner");
    } catch (error) {
      toast.error(error.message || "Failed to delete planner");
      setIsDeleting(false);
    }
  };

  const handlePlannerUpdate = (updatedPlanner) => {
    setPlanner(updatedPlanner);
  };

  if (loading) return <Spinner />;
  if (!planner) return <div className="text-center p-10 text-neutral-400">Planner not found</div>;

  return (
    <div className="relative">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/study-planner"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700">
            <ArrowLeft size={16} />
          </div>
          Back to Planners
        </Link>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 size={16} />
          {isDeleting ? "Deleting..." : "Delete Planner"}
        </button>
      </div>

      {/* Main Layout Area - Roadmap Takes Full Width */}
      <RoadmapViewer 
        planner={planner} 
        onUpdate={handlePlannerUpdate} 
      />

      {/* Floating Action Button for AI Assistant - Portaled to avoid scroll/transform context */}
      {createPortal(
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-full text-sm font-medium hover:text-white hover:bg-neutral-800 hover:border-primary/50 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.5)] group ${
            isSidebarOpen ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
          }`}
        >
          <Sparkles className="w-4 h-4 text-primary group-hover:animate-pulse" />
          Customize with AI
        </button>,
        document.body
      )}

      {/* Sliding AI Sidebar overlay - Portaled to ensure viewport relative rendering */}
      {createPortal(
        <PlannerChat 
          planner={planner} 
          onUpdate={handlePlannerUpdate} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />,
        document.body
      )}
    </div>
  );
};

export default PlannerDetailPage;
