import React, { useState } from "react";
import CheatSheetSection from "./CheatSheetSection";
import cheatSheetService from "../../services/cheatSheetService";
import toast from "react-hot-toast";

const CheatSheetViewer = ({ cheatSheet, onUpdate }) => {
  const [regeneratingIdx, setRegeneratingIdx] = useState(null);
  if (!cheatSheet?.generatedContent) return null;

  const c = cheatSheet.generatedContent;

  const handleRegenerate = async (sectionIndex, sectionHeading) => {
    setRegeneratingIdx(sectionIndex);
    try {
      const res = await cheatSheetService.regenerateSection(cheatSheet._id, { sectionIndex, sectionHeading });
      if (res.data?.section && onUpdate) {
        const updated = { ...cheatSheet };
        updated.generatedContent.sections[sectionIndex] = res.data.section;
        onUpdate(updated);
      }
      toast.success("Section regenerated!");
    } catch (err) {
      toast.error(err.message || "Failed to regenerate section");
    } finally {
      setRegeneratingIdx(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      {c.overview && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5">
          <p className="text-sm text-neutral-300 leading-relaxed">{c.overview}</p>
        </div>
      )}

      {/* Sections */}
      {c.sections?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">📌 Key Sections</h3>
          <div className="space-y-3">
            {c.sections.map((section, idx) => (
              <CheatSheetSection key={idx} section={section} sectionIndex={idx} onRegenerate={handleRegenerate} isRegenerating={regeneratingIdx === idx} />
            ))}
          </div>
        </div>
      )}

      {/* Definitions */}
      {c.definitions?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">📖 Definitions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {c.definitions.map((def, idx) => (
              <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-400 mb-1">{def.term}</p>
                <p className="text-sm text-neutral-400 leading-relaxed">{def.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulas */}
      {c.formulas?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">🔢 Formulas</h3>
          <div className="space-y-2">
            {c.formulas.map((f, idx) => (
              <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-emerald-400 mb-1">{f.name}</p>
                <p className="text-sm font-mono text-white bg-neutral-950 px-3 py-1.5 rounded-lg inline-block mb-1">{f.formula}</p>
                {f.description && <p className="text-xs text-neutral-500 mt-1">{f.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Facts */}
      {c.quickFacts?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">⚡ Quick Facts</h3>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
            {c.quickFacts.map((fact, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-neutral-300"><span className="text-amber-500 mt-0.5 flex-shrink-0">▸</span><span>{fact}</span></div>
            ))}
          </div>
        </div>
      )}

      {/* Common Mistakes */}
      {c.commonMistakes?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">❗ Common Mistakes</h3>
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 space-y-2">
            {c.commonMistakes.map((m, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-neutral-300"><span className="text-rose-400 mt-0.5 flex-shrink-0">✕</span><span>{m}</span></div>
            ))}
          </div>
        </div>
      )}

      {/* Exam Focus */}
      {c.examFocus?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">🎯 Exam Focus</h3>
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 space-y-2">
            {c.examFocus.map((e, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-neutral-300"><span className="text-indigo-400 mt-0.5 flex-shrink-0">★</span><span>{e}</span></div>
            ))}
          </div>
        </div>
      )}

      {/* Memory Tips */}
      {c.memoryTips?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">🧠 Memory Tips</h3>
          <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4 space-y-2">
            {c.memoryTips.map((t, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-neutral-300"><span className="text-violet-400 mt-0.5 flex-shrink-0">💡</span><span>{t}</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheatSheetViewer;
