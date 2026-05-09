import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb, ScrollText } from "lucide-react";
import aiService from "../../services/aiService";
import cheatSheetService from "../../services/cheatSheetService";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer";
import Modal from "../common/Modal";
import CheatSheetModeModal from "../cheatSheets/CheatSheetModeModal";
import CheatSheetCard from "../cheatSheets/CheatSheetCard";

const AIActions = () => {
  const { id: documentId } = useParams();

  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  // Cheat sheet state
  const [isCheatSheetModalOpen, setIsCheatSheetModalOpen] = useState(false);
  const [existingCheatSheets, setExistingCheatSheets] = useState([]);
  const [loadingCheatSheets, setLoadingCheatSheets] = useState(false);

  // Fetch existing cheat sheets for this document
  const fetchCheatSheets = async () => {
    setLoadingCheatSheets(true);
    try {
      const res = await cheatSheetService.getCheatSheetsForDocument(documentId);
      setExistingCheatSheets(res.data || []);
    } catch {
      // Silent fail — not critical
    } finally {
      setLoadingCheatSheets(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchCheatSheets();
  }, [documentId]);

  const handleGeneralSummary = async () => {
    setLoadingAction("summary");

    try {
      const res = await aiService.generateSummary(documentId);

      // SAFE extraction
      const summary = res.summary || res.data?.summary || res.data || "";

      console.log("SUMMARY:", summary);

      if (!summary) {
        toast.error("No summary received");
        return;
      }

      setModalContent(summary);
      setModalTitle("Generated Summary");
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate summary");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();

    if (!concept.trim()) {
      toast.error("Please enter a concept to explain");
      return;
    }

    setLoadingAction("explain");

    try {
      const res = await aiService.explainConcept(documentId, concept);

      // SAFE extraction (same as summary)
      const explanation =
        res.explanation || res.data?.explanation || res.data || "";

      console.log("EXPLANATION:", explanation);

      if (!explanation) {
        toast.error("No explanation received");
        return;
      }

      setModalContent(explanation);
      setModalTitle(`Explanation of "${concept}"`);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to explain concept");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteCheatSheet = async (id) => {
    try {
      await cheatSheetService.deleteCheatSheet(id);
      setExistingCheatSheets((prev) => prev.filter((cs) => cs._id !== id));
      toast.success("Cheat sheet deleted");
    } catch {
      toast.error("Failed to delete cheat sheet");
    }
  };

  return (
    <>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        {/* HEADER */}
        <div className="p-5 border-b border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-neutral-500">Powered by AI</p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* SUMMARY */}
          <div className="flex items-center justify-between p-5 border border-neutral-800 rounded-xl hover:bg-neutral-800/50 transition">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-white">Summarize document</h4>
              </div>
              <p className="text-sm text-neutral-500">
                Get a quick summary of the entire document
              </p>
            </div>

            <button
              onClick={handleGeneralSummary}
              disabled={loadingAction === "summary"}
              className="h-10 px-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingAction === "summary" ? "Loading..." : "Summarize"}
            </button>
          </div>

          {/* EXPLAIN */}
          <form
            onSubmit={handleExplainConcept}
            className="p-5 border border-neutral-800 rounded-xl space-y-3"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h4 className="font-semibold text-white">Explain a concept</h4>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. React Hooks"
                className="flex-1 h-11 px-4 border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-600 rounded-lg focus:outline-none focus:border-neutral-600"
              />

              <button
                type="submit"
                disabled={loadingAction === "explain" || !concept.trim()}
                className="h-11 px-5 text-white rounded-lg bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary disabled:opacity-50 whitespace-nowrap"
              >
                {loadingAction === "explain" ? "Loading..." : "Explain"}
              </button>
            </div>
          </form>

          {/* CHEAT SHEET */}
          <div className="p-5 border border-neutral-800 rounded-xl hover:bg-neutral-800/50 transition">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ScrollText className="w-4 h-4 text-purple-500" />
                  <h4 className="font-semibold text-white">
                    Generate Cheat Sheet
                  </h4>
                </div>
                <p className="text-sm text-neutral-500">
                  Create AI-powered revision notes from this document
                </p>
              </div>

              <button
                onClick={() => setIsCheatSheetModalOpen(true)}
                className="h-10 px-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Generate
              </button>
            </div>

            {/* Existing cheat sheets */}
            {existingCheatSheets.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-2">
                  Previous Cheat Sheets
                </p>
                {existingCheatSheets.map((cs) => (
                  <CheatSheetCard
                    key={cs._id}
                    cheatSheet={cs}
                    compact
                    onDelete={handleDeleteCheatSheet}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary / Explain Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <MarkdownRenderer content={modalContent} />
      </Modal>

      {/* Cheat Sheet Mode Modal */}
      <CheatSheetModeModal
        isOpen={isCheatSheetModalOpen}
        onClose={() => setIsCheatSheetModalOpen(false)}
        documentId={documentId}
        onGenerated={fetchCheatSheets}
      />
    </>
  );
};

export default AIActions;
