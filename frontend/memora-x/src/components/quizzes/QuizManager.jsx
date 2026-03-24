import React, { useState, useEffect } from 'react'
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import quizService from "../../services/quizService";
import aiService from '../../services/aiService';
import Spinner from "../common/Spinner";
import Button from "../common/Button";
import Modal from "../common/Modal";
import QuizCard from './QuizCard';
import EmptyState from '../common/EmptyState';

const QuizManager = ({documentId}) => {

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const data = await quizService.getQuizzesForDocument(documentId);
            setQuizzes(data.data);
        } catch (error) {
            toast.error("Failed to fetch quizzes");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchQuizzes();
        }
    }, [documentId]);

    const handleGenerateQuiz = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            await aiService.generateQuiz(documentId, {numQuestions});
            toast.success("Quiz generated successfully");
            setIsGenerateModalOpen(false);
            fetchQuizzes();
        } catch (error) {
            toast.error(error.message || "Failed to generate quiz");
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteRequest = (quiz) => {
        setSelectedQuiz(quiz);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
    };

    const renderQuizContent = () => {
        if (loading) {
            return <Spinner />;
        }

    if (quizzes.length === 0) {
          return {
            <EmptyState
              title="No Quizzes"
              description="Generate a quiz from your document to text your knowledge."
          />
        };
      }

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {quizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDeleteRequest} />
            ))}
        </div>
      )
    };

    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <div className="flex justify-end gap-2 mb-4">
            <Button onClick={() => setIsGenerateModalOpen(true)}>
              <Plus size={16} />
              Generate Quiz
            </Button>
        </div>

        {renderQuizContent()}


        </div>
        )
}

export default QuizManager