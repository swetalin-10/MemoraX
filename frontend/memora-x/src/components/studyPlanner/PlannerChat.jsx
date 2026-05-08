import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, X } from "lucide-react";
import studyPlannerService from "../../services/studyPlannerService";
import MarkdownRenderer from "../common/MarkdownRenderer";

const SUGGESTED_PROMPTS = [
  "Convert this into a 15-day crash course",
  "Reduce workload on weekends",
  "Add more revision sessions",
  "Prioritize difficult topics first"
];

const PlannerChat = ({ planner, onUpdate, isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(planner.chatHistory || []);
  
  const messagesEndRef = useRef(null);

  // Sync history when planner changes
  useEffect(() => {
    if (planner?.chatHistory) {
      setHistory(planner.chatHistory);
    }
  }, [planner]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 300); // Wait for slide animation
    }
  }, [history, loading, isOpen]);

  const handleSendMessage = async (e, text = message) => {
    if (e) e.preventDefault();
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text, timestamp: new Date() };
    setHistory(prev => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const response = await studyPlannerService.plannerChat(planner._id, text);
      onUpdate(response.data);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg = { 
        role: "assistant", 
        content: "Sorry, I encountered an error modifying the planner. Please try again.", 
        timestamp: new Date(),
        isError: true 
      };
      setHistory(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-start gap-3 my-4 animate-fadeIn">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-[#1E3EDC] flex items-center justify-center shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl bg-[#1a1a1d] border border-neutral-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
          <span className="ml-2 text-xs text-neutral-500">Updating roadmap...</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop (visible only on mobile if needed, but we'll use it to close on click outside) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-out Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#111113] border-l border-neutral-800 shadow-2xl z-[70] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Chat Header */}
        <div className="p-5 border-b border-neutral-800 bg-[#111113] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">AI Planner Assistant</h3>
              <p className="text-xs text-neutral-400">Modify your roadmap instantly</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-[#0a0a0b]">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-neutral-600" />
              </div>
              <h4 className="text-white font-medium mb-2">How can I help?</h4>
              <p className="text-sm text-neutral-400 mb-8 max-w-[250px]">
                Ask me to adjust durations, priorities, or focus areas.
              </p>
              <div className="flex flex-col gap-2 w-full">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(null, prompt)}
                    className="px-4 py-3 rounded-xl border border-neutral-800 bg-[#111113] hover:border-primary/50 hover:bg-primary/5 text-sm text-left text-neutral-300 transition-all"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {history.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div key={idx} className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-[#1E3EDC] flex items-center justify-center shrink-0 mt-1 shadow-md shadow-primary/20">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                      isUser 
                        ? "bg-primary text-white shadow-md shadow-primary/20 rounded-tr-sm" 
                        : msg.isError 
                          ? "bg-red-950/30 border border-red-900/40 text-red-300 rounded-tl-sm"
                          : "bg-[#1a1a1d] border border-neutral-800 text-neutral-200 rounded-tl-sm"
                    }`}>
                      {isUser ? (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      ) : (
                        <div className="text-sm prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-800">
                          <MarkdownRenderer content={msg.content} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-neutral-800 bg-[#111113] shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g. Add more revision..."
              disabled={loading}
              className="flex-1 h-12 px-4 bg-[#1a1a1d] border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-lg shadow-primary/20"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PlannerChat;
