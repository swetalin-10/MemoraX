import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, BookOpen, BrainCircuit, Clock } from "lucide-react";
import moment from "moment";

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "N/A";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <div
      className="group relative bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
      onClick={handleNavigate}
    >
      {/* Header Section */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="shrink-0 w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-200">
            <FileText className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>

          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Title */}
        <h3
          className="text-base font-semibold text-white truncate mb-2"
          title={document.title}
        >
          {document.title}
        </h3>

        {/* Document Info */}
        <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
          {document.fileSize !== undefined && (
            <>
              <span className="font-medium">
                {formatFileSize(document.fileSize)}
              </span>
            </>
          )}
        </div>

        {/* Stats Section */}
        <div className="flex items-center gap-2 flex-wrap">
          {document.flashcardsCount !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/8 rounded-lg">
              <BookOpen className="w-3.5 h-3.5 text-primary/80" strokeWidth={2} />
              <span className="text-xs font-medium text-primary/80">
                {document.flashcardsCount} Flashcards
              </span>
            </div>
          )}

          {document.quizCount !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/8 rounded-lg">
              <BrainCircuit
                className="w-3.5 h-3.5 text-primary/80"
                strokeWidth={2}
              />
              <span className="text-xs font-medium text-primary/80">
                {document.quizCount} Quizzes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-5 pt-4 border-t border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Clock className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Uploaded {moment(document.createdAt).fromNow()}</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
