import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const BaseModal = ({ 
  isOpen, 
  onClose, 
  children, 
  maxWidth = "2xl", 
  className = "" 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Prevent background scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Support pressing escape to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
  }[maxWidth] || "max-w-2xl";

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm backdrop-enter"
        onClick={onClose}
      />

      {/* MODAL CARD */}
      <div 
        className={`relative w-full ${maxWidthClass} max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-10 modal-enter flex flex-col ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default BaseModal;
