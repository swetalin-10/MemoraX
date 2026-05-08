import React, { useState } from "react";
import { UploadCloud, X, File, Sparkles, Loader2, BookOpen } from "lucide-react";

const UploadSyllabusModal = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type !== "application/pdf") return;
    setFile(selectedFile);
    if (!title) {
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(fileName);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file && title.trim()) {
      onUpload(file, title.trim(), setIsLoading);
    }
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing while loading
    setFile(null);
    setTitle("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Outer wrapper with subtle animated glow */}
      <div className="relative w-full max-w-[480px]">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 rounded-[1.5rem] blur opacity-20 animate-pulse pointer-events-none"></div>
        
        <div className="relative bg-[#111113] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden animate-zoomIn flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">Upload Syllabus</h2>
                <p className="text-xs text-neutral-400">Generate an AI study roadmap</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/[0.04] transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* File Upload Area */}
            <div className="mb-6">
              {!file ? (
                <div
                  className={`relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl transition-all duration-300 ${
                    dragActive
                      ? "border-primary bg-primary/[0.03] scale-[1.02]"
                      : "border-neutral-700/60 hover:border-neutral-500 hover:bg-white/[0.02]"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className={`p-4 rounded-full mb-3 transition-colors ${dragActive ? "bg-primary/20" : "bg-neutral-800"}`}>
                    <UploadCloud className={`w-8 h-8 ${dragActive ? "text-primary" : "text-neutral-400"}`} />
                  </div>
                  <p className="text-sm font-medium text-neutral-200">
                    Drag & drop your syllabus PDF
                  </p>
                  <p className="text-xs text-neutral-500 mt-1.5">
                    or click to browse files (Max 10MB)
                  </p>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,application/pdf"
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-3 rounded-xl bg-primary/20 text-primary shrink-0">
                      <File className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate pr-4">
                        {file.name}
                      </p>
                      <p className="text-xs text-primary/60 mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    disabled={isLoading}
                    className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-colors rounded-xl shrink-0 disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Title Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Course or Subject Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Database Management"
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                required
                disabled={isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-5 py-3 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || !title.trim() || isLoading}
                className="relative flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-70 disabled:cursor-not-allowed rounded-xl transition-all shadow-[0_8px_20px_rgba(61,94,229,0.3)] overflow-hidden"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white/80" />
                    Generate Roadmap
                  </>
                )}
                {/* Button shine effect */}
                {!isLoading && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer pointer-events-none"></div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadSyllabusModal;
