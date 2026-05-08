import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Link
          to="/study-planner"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
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

      {/* Main Layout Area */}
      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        
        {/* Left Side: Roadmap Viewer (Takes up ~65% of space) */}
        <div className="flex-1 lg:w-2/3 h-full min-h-[500px] overflow-hidden">
          <RoadmapViewer 
            planner={planner} 
            onUpdate={handlePlannerUpdate} 
          />
        </div>

        {/* Right Side: AI Assistant Chat (Takes up ~35% of space) */}
        <div className="lg:w-1/3 h-[500px] lg:h-full shrink-0">
          <PlannerChat 
            planner={planner} 
            onUpdate={handlePlannerUpdate} 
          />
        </div>

      </div>
    </div>
  );
};

export default PlannerDetailPage;
