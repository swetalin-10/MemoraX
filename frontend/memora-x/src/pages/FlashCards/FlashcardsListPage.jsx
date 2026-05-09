import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Trash2, Loader2, X } from 'lucide-react';
import flashcardService from '../../services/flashcardService';
import PageHeader from "../../components/common/PageHeader";
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import FlashcardSetCard from "../../components/flashcards/FlashcardSetCard";
import DocumentSelectModal from "../../components/common/DocumentSelectModal";
import Button from "../../components/common/Button";
import toast from 'react-hot-toast';

const FlashcardsListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW STATES
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();
        setFlashcardSets(response.data || []);
      } catch (error) {
        toast.error('Failed to fetch flashcard sets');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSets();
  }, []);

  // ✅ OPEN CONFIRM BOX
  const handleDelete = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  // ✅ CONFIRM DELETE
  const confirmDelete = async () => {
    try {
      setDeleting(true);

      await flashcardService.deleteFlashcardSet(selectedId);

      setFlashcardSets((prev) =>
        prev.filter((set) => set._id !== selectedId)
      );

      toast.success("Flashcard set deleted");
      setShowConfirm(false);
    } catch (error) {
      toast.error(error.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleProceed = (doc) => {
    setShowModal(false);
    navigate(`/documents/${doc._id}?tab=flashcards&generate=true`);
  };

  const renderContent = () => {
    if (loading) return <Spinner label="Loading flashcards..." />;

    if (!flashcardSets.length) {
      return (
        <EmptyState
          title="No Flashcard Sets"
          description="Generate flashcards from any document to start studying with spaced repetition."
          icon={BookOpen}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {flashcardSets.map((set) => (
          <FlashcardSetCard
            key={set._id}
            flashcardSet={set}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="All Flashcard Sets" subtitle="Study and review your AI-generated flashcards">
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> New Flashcards
        </Button>
      </PageHeader>

      {renderContent()}

      {/* ✅ CUSTOM DELETE MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-6 modal-enter">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-400" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                Delete Flashcard Set
              </h2>
              <p className="text-sm text-neutral-400">
                Are you sure you want to delete this set? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
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
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Selection Modal */}
      <DocumentSelectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onProceed={handleProceed}
        title="Select a Document for Flashcards"
      />
    </div>
  );
};

export default FlashcardsListPage;