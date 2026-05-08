import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Route, AlertCircle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import SyllabusDetector from "../../components/studyPlanner/SyllabusDetector";
import PlannerCard from "../../components/studyPlanner/PlannerCard";
import UploadSyllabusModal from "../../components/studyPlanner/UploadSyllabusModal";
import studyPlannerService from "../../services/studyPlannerService";
import documentService from "../../services/documentService";
import toast from "react-hot-toast";

const StudyPlannerPage = () => {
  const [planners, setPlanners] = useState([]);
  const [detectedDocs, setDetectedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [plannersRes, detectRes] = await Promise.all([
        studyPlannerService.getPlanners(),
        studyPlannerService.detectSyllabusDocs(),
      ]);
      setPlanners(plannersRes.data);
      setDetectedDocs(detectRes.data);
    } catch (error) {
      toast.error(error.message || "Failed to load study planners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 5s if there are any planners in "generating" state
    const interval = setInterval(() => {
      if (planners.some(p => p.status === "generating")) {
        fetchData();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [planners]);

  const handleGenerateFromDoc = async (documentId) => {
    try {
      setGeneratingId(documentId);
      const res = await studyPlannerService.generatePlanner(documentId);
      toast.success(res.message || "Generation started");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to generate planner");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleUploadAndGenerate = async (file, title) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      // 1. Upload via existing document service
      const uploadRes = await documentService.uploadDocument(formData);
      
      // 2. Start generation process
      if (uploadRes.success && uploadRes.data?._id) {
        setIsUploadModalOpen(false);
        await handleGenerateFromDoc(uploadRes.data._id);
      }
    } catch (error) {
      toast.error(error.message || "Failed to process upload");
    }
  };

  if (loading && planners.length === 0) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <PageHeader 
          title="AI Study Planner" 
          subtitle="Generate personalized study roadmaps from your syllabus." 
        />
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all duration-200 shadow-[0_8px_30px_rgb(61,94,229,0.2)] shrink-0"
        >
          <Plus size={18} />
          New Planner
        </button>
      </div>

      <SyllabusDetector 
        documents={detectedDocs} 
        onGenerate={handleGenerateFromDoc} 
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-6">Your Study Planners</h2>
        
        {planners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30 text-center">
            <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center mb-6">
              <Route className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No planners yet</h3>
            <p className="text-neutral-400 max-w-sm mb-6">
              Upload a syllabus PDF or select a detected document above to generate your first AI study roadmap.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-all"
            >
              <Plus size={18} />
              Upload Syllabus
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planners.map((planner) => (
              <PlannerCard key={planner._id} planner={planner} />
            ))}
          </div>
        )}
      </div>

      <UploadSyllabusModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadAndGenerate}
      />
    </div>
  );
};

export default StudyPlannerPage;
