import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare } from "lucide-react";
import studyPlannerService from "../../services/studyPlannerService";
import MarkdownRenderer from "../common/MarkdownRenderer";

const SUGGESTED_PROMPTS = [
  "Convert this into a 15-day crash course",
  "Reduce workload on weekends",
  "Add more revision sessions",
  "Prioritize difficult topics first"
];

const PlannerChat = ({ planner, onUpdate }) => {
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
    scrollToBottom();
  }, [history, loading]);

  const handleSendMessage = async (e, text = message) => {
    if (e) e.preventDefault();
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text, timestamp: new Date() };
    setHistory(prev => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const response = await studyPlannerService.plannerChat(planner._id, text);
      
      // Update parent with the modified planner
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
      <div className="px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          <span className="ml-2 text-xs text-neutral-500">Updating roadmap...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex items-center gap-3 shrink-0">
        <div className="p-2 rounded-lg bg-primary/20 text-primary">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Planner Assistant</h3>
          <p className="text-xs text-neutral-400">Ask me to modify your roadmap</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Sparkles className="w-10 h-10 text-neutral-600 mb-4" />
            <p className="text-sm text-neutral-400 mb-6 max-w-[250px]">
              You can modify this roadmap instantly by asking me. Try one of these:
            </p>
            <div className="flex flex-col gap-2 w-full">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(null, prompt)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:border-primary/50 hover:bg-primary/5 text-xs text-left text-neutral-300 transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div key={idx} className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-[#1E3EDC] flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                    isUser 
                      ? "bg-primary text-white" 
                      : msg.isError 
                        ? "bg-red-950/30 border border-red-900/40 text-red-300"
                        : "bg-neutral-900 border border-neutral-800 text-neutral-200"
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
      <div className="p-3 border-t border-neutral-800 bg-neutral-900 shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="E.g. Add more revision..."
            disabled={loading}
            className="flex-1 h-10 px-4 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlannerChat;
