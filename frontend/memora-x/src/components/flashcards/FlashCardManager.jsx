import React, { useState, useEffect } from 'react';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    ArrowLeft,
    Sparkles,
    Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import FlashCard from "./Flashcard";

const FlashCardManager = ({documentId}) => {

    const [flashcardsSets, setFlashcardsSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null);

    const fetchFlashcardsSets = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardsSets(documentId);
            setFlashcardsSets(response.data);
        } catch (error) {
            toast.error("Failed to fetch flashcards sets");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

        useEffect(() => {
        if (documentId) {
            fetchFlashcardsSets();
        }
        }, [documentId]);

        const handleGenerateFlashcards = async () => {
            setGenerating(true);
            try {
                await aiService.generateFlashcards(documentId);
                toast.success("Flashcards generated successfully");
                fetchFlashcardsSets();
            } catch (error) {
                toast.error("Failed to generate flashcards");
            } finally {
                setGenerating(false);
            }
        };

        const handleNextCard = () => {
            if (selectedSet) {
                handleReview(currentCardIndex);
                setCurrentCardIndex((prevIndex) => (prevIndex + 1) % selectedSet.flashcards.length);
            }
        };

        const handlePrevCard = () => {
            if (selectedSet) {
                handleReview(currentCardIndex);
                setCurrentCardIndex((prevIndex) => (prevIndex - 1 + selectedSet.flashcards.length) % selectedSet.flashcards.length);
            }
        };

        const handleReview = async (cardIndex) => {
            const currentCard = selectedSet?.cards[currentCardIndex];
            if (!currentCard) return;
            try {
                await flashcardService.reviewFlashcard(currentCard._id, index);
                toast.success("Flashcard reviewed!");
                } catch (error) {
                toast.error("Failed to review flashcard");
            }  
        };

        const handleToggleStar = async (cardId) => {
        };

        const handleDeleteRequest = (e, set) => {
            e.stopPropagation();
            setSelectedSet(set);
            setIsDeleteModalOpen(true);
            
        };

        const handleConfirmDelete = async () => {
            if (!setToDelete) return;
            setDeleting(true);
            try {
              await flashcardService.deleteFlashcardSet(setToDelete._id);
              toast.success("Flashcard set deleted successfully");
              setIsDeleteModalOpen(false);
              setSetToDelete(null);
              fetchFlashcardsSets();
            } catch (error) {
              toast.error("Failed to delete flashcard set");
            } finally {
              setDeleting(false);
            }
        };

        const handleSelectSet = (set) => {
            setSelectedSet(set);
            setCurrentCardIndex(0);
        };

        const renderFlashcardViewer = () => {
            return "renderFlashcardViewer"
        };

        const renderSetList = () => {
            if (loading) {
                return (
                    <div className="flex items-center justify-center py-20">
                        <Spinner />
                    </div>
                );
            }

           if(flashcardsSets.length === 0) {
           }

    return (
      <div className="space-y-6">
        {/* {Header with Generate Button} */}
        <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900"> Your Flashcards Sets</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {flashcardsSets.length}{" "}
                  {flashcardsSets.length === 1 ? "set" : "sets"} available
                </p>
              </div>
              <button
                onClick={handleGenerateFlashcards}
                disabled={generating}
                className="group inline-flex items-center gap-2 px-5 h-11 bf-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                {generating ? (
                 <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generatingg...
                 </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    Generate New Set
                  </>
                )}
            </button>
          </div>

        {/* {Flashcard Sets Grid} */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcardsSets.map((set) => (
              <div
                key={set._id}
                onClick={() => handleSelectSet(set)}
                className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  {/* {Delete Button} */}
                  <button
                    onClick={(e) => handleDeleteRequest(e, set)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:tex-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <Trash className="w-4 h-4" strokeWidth={2} />
                  </button>

                  {/* {Set Content} */}
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100">
                    <Brain className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                  </div>

                <div>
                  <h4 className="text-base font-semibold text-slate-900 mb-1">
                        Flashcard Set
                  </h4>
                  <p className="text-xs font-medium text-slate-500 uppercase -tracking-wide">
                     Created {moment(set.createdAt).format("MMM D, YYYY")}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-sm fnt-semibold text-slate-700">
                    {set.flashcards.length}{" "}
                    {set.flashcards.length === 1 ? "card" : "cards"}
                    </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
        </div>
           );
        };

    return (
        <>
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
         {selectedSet ? renderFlashcardViewer() : renderSetList()}
        </div>

        {/* {Delete Confirmation Modal} */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Flashcard Set"
        >
            <div className="space-y-6">
                <p className="text-smtext-slate-500">
                    Are you sure you want to delete this flashcard set? This action cannot be undone and all the cards will be permanently deleted.
                </p>
                <div className="flex items-center justify-end gap-2 pt-4">
                    <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={deleting}
                    className="px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                      </button>
                      <button
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="px-5 h-11 bg-linear-to-r bg-rose-500 to-rose-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:act:scale-100"
                    >
                    {deleting ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Deleting...
                        </span>
                        ) : (
                          "Delete Set"
                    )}
                    </button>
                </div>
            </div>
          </Modal>
        
        </>
        )
    }

export default FlashCardManager
