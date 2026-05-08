import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageSquare, Sparkles, RotateCcw, BookOpen } from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../common/Spinner";
import MarkdownRenderer from "../common/MarkdownRenderer";

// ─── Typing Indicator Component ──────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-start gap-3 my-4 animate-fadeIn">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[#1E3EDC] flex items-center justify-center shrink-0">
      <Sparkles className="w-4 h-4 text-white" />
    </div>
    <div className="px-5 py-4 rounded-2xl bg-neutral-900 border border-neutral-800">
      <div className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1s" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
          style={{ animationDelay: "150ms", animationDuration: "1s" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
          style={{ animationDelay: "300ms", animationDuration: "1s" }}
        />
        <span className="ml-2 text-xs text-neutral-500">Analyzing document...</span>
      </div>
    </div>
  </div>
);

// ─── Suggested Questions Component ───────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  { text: "What is this document about?", icon: "📄" },
  { text: "Summarize the key points", icon: "📋" },
  { text: "What problem does this solve?", icon: "🎯" },
  { text: "What are the main conclusions?", icon: "💡" },
];

const SuggestedQuestions = ({ onSelect }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-4">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-[#1E3EDC]/20 border border-primary/20 flex items-center justify-center mb-4">
      <BookOpen className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-base font-semibold text-neutral-200 mb-1">
      Document Assistant
    </h3>
    <p className="text-sm text-neutral-500 mb-6 max-w-sm">
      Ask anything about this document — I understand context, not just keywords.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
      {SUGGESTED_QUESTIONS.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q.text)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-primary/40 hover:bg-neutral-800/60 text-left transition-all duration-200"
        >
          <span className="text-base">{q.icon}</span>
          <span className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-colors">
            {q.text}
          </span>
        </button>
      ))}
    </div>
  </div>
);

// ─── Main Chat Interface ─────────────────────────────────────────────────────
const ChatInterface = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [failedMessage, setFailedMessage] = useState(null); // Track failed messages for retry

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Smooth scroll to bottom, but only when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);

  useEffect(() => {
    const fetchInitialHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history, loading, scrollToBottom]);

  // ── Send message handler ────────────────────────────────────────────────
  const sendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      role: "user",
      content: content,
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);
    setFailedMessage(null);

    try {
      const response = await aiService.chat(documentId, userMessage.content);

      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date(),
      };

      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setFailedMessage(content); // Store for retry

      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your question. Please try again.",
        timestamp: new Date(),
        isError: true,
      };

      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    sendMessage(message);
  };

  // ── Handle suggested question click ─────────────────────────────────────
  const handleSuggestedQuestion = (questionText) => {
    sendMessage(questionText);
  };

  // ── Handle retry ────────────────────────────────────────────────────────
  const handleRetry = () => {
    if (failedMessage) {
      // Remove the last error message from history
      setHistory((prev) => prev.slice(0, -1));
      sendMessage(failedMessage);
    }
  };

  // ── Render individual message ───────────────────────────────────────────
  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";
    const isError = msg.isError;
    const isLatest = index === history.length - 1;

    return (
      <div
        key={index}
        className={`flex items-start gap-3 my-4 w-full ${
          isUser ? "justify-end" : ""
        } animate-fadeIn`}
        style={{ animationDelay: isLatest ? "0ms" : "0ms" }}
      >
        {!isUser && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isError
                ? "bg-red-900/40 border border-red-800/50"
                : "bg-gradient-to-br from-primary to-[#1E3EDC]"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isError ? "text-red-400" : "text-white"}`} />
          </div>
        )}

        <div
          className={`max-w-xl p-4 rounded-2xl ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-[#1E3EDC] text-white"
              : isError
              ? "bg-red-950/30 border border-red-900/40 text-red-300"
              : "bg-neutral-900 border border-neutral-800 text-neutral-200"
          }`}
        >
          {isUser ? (
            <p className="text-sm">{msg.content}</p>
          ) : (
            <MarkdownRenderer content={msg.content} />
          )}

          {/* Retry button for error messages */}
          {isError && isLatest && failedMessage && (
            <button
              onClick={handleRetry}
              className="mt-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>

        {isUser && (
          <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-200 font-semibold shrink-0">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>
    );
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] w-full bg-neutral-900 border border-neutral-800 rounded-2xl">
      {/* Messages area */}
      <div ref={messagesContainerRef} className="flex-1 p-6 pb-20 overflow-y-auto">
        {history.length === 0 ? (
          <SuggestedQuestions onSelect={handleSuggestedQuestion} />
        ) : (
          history.map(renderMessage)
        )}

        {loading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-neutral-800">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about this document..."
            className="flex-1 h-11 px-4 border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-600 rounded-xl focus:outline-none focus:border-neutral-600 transition-colors"
          />

          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="w-11 h-11 flex items-center justify-center bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Inline animation styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
