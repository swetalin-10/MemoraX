import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, BarChart2, Trash2, Award } from "lucide-react";
import moment from "moment";
import Button from "../common/Button";

const QuizCard = ({ quiz, onDelete }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (quiz?.userAnswers?.length > 0) {
      navigate(`/quizzes/${quiz._id}/results`);
    } else {
      navigate(`/quizzes/${quiz._id}`);
    }
  };

  return (
    <div 
      className="group relative bg-neutral-900 border border-neutral-800 hover:border-primary/40 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5"
      onClick={handleCardClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(quiz);
        }}
        className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" strokeWidth={2} />
      </button>

      <div className="space-y-4">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 py-1 rounded-lg text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1">
            <Award className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
            <span className="text-primary">Score: {quiz.score}</span>
          </div>
        </div>

        <div>
          <h3
            className="text-base font-semibold text-white mb-1 line-clamp-2"
            title={quiz.title}
          >
            {quiz.title ||
              `Quiz - ${moment(quiz.createdAt).format("MMM DD, YYYY")}`}
          </h3>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Created {moment(quiz.createdAt).format("MMM DD, YYYY")}
          </p>
        </div>

        {/* Quiz Info */}
        <div className="flex items-center gap-3 pt-2 border-t border-neutral-800">
          <div className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg">
            <span className="text-sm font-semibold text-neutral-300">
              {quiz.questions.length}{" "}
              {quiz.questions.length === 1 ? "Question" : "Questions"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions Button */}
      <div className="mt-5 pt-4 border-t border-neutral-800">
        {quiz?.userAnswers?.length > 0 ? (
          <Button 
            variant="secondary" 
            className="w-full"
            icon={<BarChart2 className="w-4 h-4" strokeWidth={2.5} />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/quizzes/${quiz._id}/results`);
            }}
          >
            View Results
          </Button>
        ) : (
          <Button 
            variant="primary" 
            className="w-full"
            icon={<Play className="w-4 h-4" strokeWidth={2.5} />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/quizzes/${quiz._id}`);
            }}
          >
            Start Quiz
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
