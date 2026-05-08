import React, { useState, useEffect } from "react";
import { Plus, Route, Sparkles } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
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
      const res = await studyPlannerService.generatePlanner(documentId);
      toast.success(res.message || "Generation started");
      fetchData(); // Immediately refresh to show "Generating..." state
    } catch (error) {
      toast.error(error.message || "Failed to generate planner");
    }
  };

  const handleUploadAndGenerate = async (file, title, setModalLoading) => {
    try {
      setModalLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      // 1. Upload via existing document service
      const uploadRes = await documentService.uploadDocument(formData);
      
      // 2. Start generation process
      if (uploadRes.success && uploadRes.data?._id) {
        await studyPlannerService.generatePlanner(uploadRes.data._id);
        toast.success("Syllabus uploaded and generation started!");
        setIsUploadModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || "Failed to process upload");
    } finally {
      setModalLoading(false);
    }
  };

  if (loading && planners.length === 0) return <Spinner />;

  // Create unified items array
  const unifiedItems = [
    // 1. Un-generated detected syllabus documents
    ...detectedDocs
      .filter((doc) => !doc.hasPlannerGenerated)
      .map((doc) => ({ ...doc, type: "document" })),
    // 2. Already generated or generating planners
    ...planners.map((p) => ({ ...p, type: "planner" }))
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <PageHeader 
          title="AI Study Planner" 
          subtitle="Your intelligent workspace for structured learning roadmaps." 
        />
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all duration-200 shadow-[0_8px_30px_rgb(61,94,229,0.3)] shrink-0"
        >
          <Plus size={18} />
          Upload Syllabus
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-semibold text-white">Your AI Study Plans</h2>
        </div>
        
        {unifiedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 border border-dashed border-neutral-800 rounded-3xl bg-neutral-900/30 text-center">
            <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Route className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No active study plans</h3>
            <p className="text-neutral-400 max-w-sm mb-8">
              Upload a course syllabus or outline PDF to instantly generate an adaptive weekly study roadmap.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded-xl font-medium transition-all shadow-md"
            >
              <Plus size={18} />
              Create First Planner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unifiedItems.map((item) => (
              <PlannerCard 
                key={item._id} 
                item={item} 
                onGenerate={handleGenerateFromDoc} 
              />
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
