import React from "react";
import { FileText, Plus, Sparkles } from "lucide-react";
import moment from "moment";

const SyllabusDetector = ({ documents, onGenerate }) => {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="mb-8 animate-fadeIn">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-white">
          Auto-Detected Syllabus Documents
        </h2>
      </div>
      <p className="text-sm text-neutral-400 mb-5">
        We found these documents in your uploads that look like a syllabus or course roadmap. Would you like to generate an AI study plan for them?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors"
          >
            <div className="flex items-start gap-3 overflow-hidden">
              <div className="p-2 rounded-lg bg-neutral-800 text-neutral-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-white truncate" title={doc.title}>
                  {doc.title}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Uploaded {moment(doc.uploadDate).format("MMM D, YYYY")}
                </p>
              </div>
            </div>

            {doc.hasPlannerGenerated ? (
              <span className="text-xs font-medium text-emerald-500 shrink-0 ml-3">
                Generated
              </span>
            ) : (
              <button
                onClick={() => onGenerate(doc._id)}
                className="shrink-0 ml-3 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                title="Generate Roadmap"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusDetector;
