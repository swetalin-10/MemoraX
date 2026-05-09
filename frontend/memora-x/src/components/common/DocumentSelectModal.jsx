import React, { useState, useEffect } from "react";
import { FileText, X } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Spinner from "./Spinner";
import Button from "./Button";

const DocumentSelectModal = ({ isOpen, onClose, onProceed, title, documents: initialDocs }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    if (initialDocs && initialDocs.length > 0) {
      setDocuments(initialDocs);
      setLoading(false);
      setSelectedDoc(null);
      return;
    }

    const fetchDocs = async () => {
      setLoading(true);
      try {
        const response = await documentService.getDocuments();
        setDocuments(response.data || []);
      } catch (error) {
        toast.error("Failed to load documents");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
    // Reset selection when modal opens
    setSelectedDoc(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (!selectedDoc) return;
    onProceed(selectedDoc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm backdrop-enter px-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            {title || "Select a Document"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all duration-200"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Document List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-neutral-800 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-neutral-500" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-neutral-400">No documents found</p>
            <p className="text-xs text-neutral-500 mt-1">
              Upload a document first to generate content
            </p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
            {documents.map((doc) => (
              <div
                key={doc._id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedDoc?._id === doc._id
                    ? "border-primary bg-primary/10"
                    : "border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      selectedDoc?._id === doc._id
                        ? "bg-primary/20"
                        : "bg-neutral-800"
                    }`}
                  >
                    <FileText
                      className={`w-4 h-4 ${
                        selectedDoc?._id === doc._id
                          ? "text-primary"
                          : "text-neutral-400"
                      }`}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {doc.title}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {doc.status === "ready" ? "Ready" : doc.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
          <Button
            onClick={onClose}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedDoc}
            onClick={handleProceed}
            variant="primary"
          >
            Proceed
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentSelectModal;
