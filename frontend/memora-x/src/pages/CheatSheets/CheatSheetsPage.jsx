import React, { useState, useEffect } from "react";
import { Plus, ScrollText, Trash2 } from "lucide-react";
import cheatSheetService from "../../services/cheatSheetService";
import CheatSheetCard from "../../components/cheatSheets/CheatSheetCard";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import DocumentSelectModal from "../../components/common/DocumentSelectModal";
import CheatSheetModeModal from "../../components/cheatSheets/CheatSheetModeModal";
import toast from "react-hot-toast";

const CheatSheetsPage = () => {
  const [cheatSheets, setCheatSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  // Delete Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCheatSheets = async () => {
    try {
      const response = await cheatSheetService.getAllCheatSheets();
      setCheatSheets(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch cheat sheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheatSheets();
  }, []);

  const handleDelete = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await cheatSheetService.deleteCheatSheet(selectedId);
      setCheatSheets((prev) => prev.filter((cs) => cs._id !== selectedId));
      toast.success("Cheat sheet deleted");
      setShowConfirm(false);
    } catch (error) {
      toast.error(error.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleDocumentSelected = (doc) => {
    setSelectedDocumentId(doc._id);
    setShowSelectModal(false);
    setShowGenerateModal(true);
  };

  const renderContent = () => {
    if (loading) return <Spinner label="Loading cheat sheets..." />;

    if (!cheatSheets.length) {
      return (
        <EmptyState
          icon={ScrollText}
          title="No cheat sheets yet"
          description="Generate AI-powered revision notes from your documents."
          buttonText="Create Cheat Sheet"
          onActionClick={() => setShowSelectModal(true)}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
        {cheatSheets.map((cs) => (
          <CheatSheetCard key={cs._id} cheatSheet={cs} onDelete={handleDelete} />
        ))}
      </div>
    );
  };

  return (
    <div className="page-enter">
      <PageHeader 
        title="Cheat Sheets" 
        subtitle="Ultra-compressed, AI-powered revision notes"
      >
        <Button variant="primary" onClick={() => setShowSelectModal(true)}>
          <Plus className="w-4 h-4" /> New Cheat Sheet
        </Button>
      </PageHeader>

      {renderContent()}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 backdrop-enter">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 modal-enter">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-400" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                Delete Cheat Sheet
              </h2>
              <p className="text-sm text-neutral-400">
                Are you sure you want to delete this cheat sheet? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                loading={deleting}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Generation Flow */}
      <DocumentSelectModal
        isOpen={showSelectModal}
        onClose={() => setShowSelectModal(false)}
        onProceed={handleDocumentSelected}
        title="Select a Document for Cheat Sheet"
      />
      <CheatSheetModeModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        documentId={selectedDocumentId}
        onGenerated={fetchCheatSheets}
      />
    </div>
  );
};

export default CheatSheetsPage;
