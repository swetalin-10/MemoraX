import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Trash2,
  BrainCircuit,
  Clock,
  CheckCircle2,
  HelpCircle,
  Play,
  Plus,
} from "lucide-react";
import moment from "moment";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import DocumentSelectModal from "../../components/common/DocumentSelectModal";
import Button from "../../components/common/Button";
import BaseModal from "../../components/common/BaseModal";

const QuizzesListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        // 1. Get all documents
        const docResponse = await documentService.getDocuments();
        const docs = docResponse.data || [];
        setDocuments(docs);

        // 2. Fetch quizzes for each document and flatten
        const quizPromises = docs.map(async (doc) => {
          try {
            const quizResponse = await quizService.getQuizzesForDocument(
              doc._id
            );
            const docQuizzes = quizResponse.data || [];
            // Attach document title to each quiz for display
            return docQuizzes.map((quiz) => ({
              ...quiz,
              documentTitle: doc.title,
            }));
          } catch {
            // If a doc has no quizzes or request fails, skip silently
            return [];
          }
        });

        const results = await Promise.all(quizPromises);
        const allQuizzes = results.flat();

        // Sort by most recent first
        allQuizzes.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setQuizzes(allQuizzes);
      } catch (error) {
        toast.error("Failed to fetch quizzes");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuizzes();
  }, []);

  const handleDeleteClick = (e, quiz) => {
    e.stopPropagation();
    setSelectedQuiz(quiz);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedQuiz) return;
    console.log("Deleting quiz:", selectedQuiz._id);
    setQuizzes((prev) => prev.filter((q) => q._id !== selectedQuiz._id));
    toast.success("Quiz removed");
    setShowDeleteModal(false);
    setSelectedQuiz(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedQuiz(null);
  };

  const handleCardClick = (quiz) => {
    // If quiz has userAnswers (already attempted), go to results
    if (quiz.userAnswers && quiz.userAnswers.length > 0) {
      navigate(`/quizzes/${quiz._id}/results`);
    } else {
      navigate(`/quizzes/${quiz._id}`);
    }
  };

  const handleProceed = (doc) => {
    setShowModal(false);
    navigate(`/documents/${doc._id}?tab=quizzes&generate=true`);
  };

  const getScoreInfo = (quiz) => {
    if (!quiz.userAnswers || quiz.userAnswers.length === 0) return null;
    const correct = quiz.userAnswers.filter((a) => a.isCorrect).length;
    const total = quiz.questions?.length || quiz.userAnswers.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, percentage };
  };

  // ── Empty State ──
  const renderEmptyState = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-800/80 border border-neutral-700/50 mb-6">
          <ClipboardList
            className="w-7 h-7 text-neutral-500"
            strokeWidth={1.5}
          />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No quizzes yet
        </h3>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Generate quizzes from your documents to test your knowledge
        </p>
      </div>
    </div>
  );

  // ── Quiz Card ──
  const renderQuizCard = (quiz) => {
    const scoreInfo = getScoreInfo(quiz);
    const questionCount = quiz.questions?.length || 0;
    const isAttempted = scoreInfo !== null;

    return (
      <div
        key={quiz._id}
        className="group relative bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer"
        onClick={() => handleCardClick(quiz)}
      >
        {/* Header Section */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Icon */}
            <div className="shrink-0 w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-200">
              <BrainCircuit
                className="w-5 h-5 text-primary"
                strokeWidth={2}
              />
            </div>

            {/* Delete Button — hidden by default, fades in on hover */}
            <button
              onClick={(e) => handleDeleteClick(e, quiz)}
              className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* Title */}
          <h3
            className="text-base font-semibold text-white truncate mb-1"
            title={quiz.documentTitle || "Untitled Quiz"}
          >
            {quiz.documentTitle || "Untitled Quiz"}
          </h3>

          {/* Subtitle — document source */}
          <p className="text-xs text-neutral-500 mb-3 truncate">
            Quiz
          </p>

          {/* Stats Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Question count */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 border border-neutral-700/50 rounded-lg">
              <HelpCircle
                className="w-3.5 h-3.5 text-neutral-400"
                strokeWidth={2}
              />
              <span className="text-xs font-medium text-neutral-300">
                {questionCount} {questionCount === 1 ? "Question" : "Questions"}
              </span>
            </div>

            {/* Score badge — only if attempted */}
            {scoreInfo && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/8 border border-primary/15 rounded-lg">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-primary"
                  strokeWidth={2}
                />
                <span className="text-xs font-medium text-primary">
                  {scoreInfo.percentage}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Clock className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{moment(quiz.createdAt).fromNow()}</span>
            </div>

            {/* Status badge */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                isAttempted
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {isAttempted ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Not attempted
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Main Render ──
  return (
    <div className="min-h-screen">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="My Quizzes"
          subtitle="View and manage all your quizzes"
        >
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> New Quiz
          </Button>
        </PageHeader>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner label="Loading quizzes..." />
          </div>
        ) : quizzes.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {quizzes.map((quiz) => renderQuizCard(quiz))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <BaseModal isOpen={showDeleteModal} onClose={cancelDelete} maxWidth="md" className="p-6">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-400" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Delete Quiz
          </h2>
          <p className="text-sm text-neutral-400">
            Are you sure you want to delete this quiz? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={cancelDelete}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </BaseModal>

      {/* Document Selection Modal */}
      <DocumentSelectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onProceed={handleProceed}
        title="Select a Document for Quiz"
        documents={documents}
      />
    </div>
  );
};

export default QuizzesListPage;
