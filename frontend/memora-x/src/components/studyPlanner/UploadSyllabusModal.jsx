import React, { useState } from "react";
import { UploadCloud, X, File, AlertCircle } from "lucide-react";

const UploadSyllabusModal = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [dragActive, setDragActive] = useState(false);

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
    if (selectedFile.type !== "application/pdf") {
      return; // Could add toast here, but relying on accept="application/pdf" for now
    }
    setFile(selectedFile);
    if (!title) {
      // Auto-fill title without extension
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(fileName);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file && title.trim()) {
      onUpload(file, title.trim());
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-zoomIn">
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Upload Syllabus</h2>
          <button
            onClick={handleClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {/* File Upload Area */}
          <div className="mb-5">
            {!file ? (
              <div
                className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <UploadCloud
                  className={`w-10 h-10 mb-3 ${
                    dragActive ? "text-primary" : "text-neutral-500"
                  }`}
                />
                <p className="text-sm font-medium text-neutral-300">
                  Click or drag PDF to upload
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  PDF format only, max 10MB
                </p>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,application/pdf"
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <File className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-2 text-neutral-400 hover:text-red-400 transition-colors rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Subject / Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Database Management"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              required
            />
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300/80 leading-relaxed">
              We'll automatically extract the syllabus content and generate an intelligent study roadmap for you.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !title.trim()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg shadow-primary/25"
            >
              Upload & Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadSyllabusModal;
