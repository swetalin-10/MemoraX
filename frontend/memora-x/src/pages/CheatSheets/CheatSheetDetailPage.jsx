import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import cheatSheetService from "../../services/cheatSheetService";
import CheatSheetHeader from "../../components/cheatSheets/CheatSheetHeader";
import CheatSheetViewer from "../../components/cheatSheets/CheatSheetViewer";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CheatSheetDetailPage = () => {
  const { id } = useParams();
  const [cheatSheet, setCheatSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const viewerRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await cheatSheetService.getCheatSheetById(id);
        setCheatSheet(res.data);
      } catch (err) {
        toast.error("Failed to load cheat sheet");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // ── Export helpers ─────────────────────────────────────────────────────
  const buildPlainText = () => {
    if (!cheatSheet?.generatedContent) return "";
    const c = cheatSheet.generatedContent;
    let text = `# ${c.title}\n\n`;
    if (c.overview) text += `${c.overview}\n\n`;
    c.sections?.forEach((s) => {
      text += `## ${s.heading}\n`;
      s.points?.forEach((p) => { text += `- ${p}\n`; });
      text += "\n";
    });
    if (c.definitions?.length) {
      text += `## Definitions\n`;
      c.definitions.forEach((d) => { text += `**${d.term}**: ${d.definition}\n`; });
      text += "\n";
    }
    if (c.formulas?.length) {
      text += `## Formulas\n`;
      c.formulas.forEach((f) => { text += `**${f.name}**: ${f.formula}${f.description ? ` — ${f.description}` : ""}\n`; });
      text += "\n";
    }
    if (c.quickFacts?.length) {
      text += `## Quick Facts\n`;
      c.quickFacts.forEach((f) => { text += `- ${f}\n`; });
      text += "\n";
    }
    if (c.commonMistakes?.length) {
      text += `## Common Mistakes\n`;
      c.commonMistakes.forEach((m) => { text += `- ${m}\n`; });
      text += "\n";
    }
    if (c.examFocus?.length) {
      text += `## Exam Focus\n`;
      c.examFocus.forEach((e) => { text += `- ${e}\n`; });
      text += "\n";
    }
    if (c.memoryTips?.length) {
      text += `## Memory Tips\n`;
      c.memoryTips.forEach((t) => { text += `- ${t}\n`; });
    }
    return text;
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(buildPlainText());
    toast.success("Copied to clipboard!");
  };

  const handleExportMarkdown = () => {
    const text = buildPlainText();
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(cheatSheet.title || "cheatsheet").replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Markdown exported!");
  };

  const handleExportPDF = async () => {
    const el = viewerRef.current;
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#0a0a0a" });
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ratio = pw / canvas.width;
      const sh = canvas.height * ratio;
      const pages = Math.ceil(sh / ph);
      let y = 0;
      for (let p = 0; p < pages; p++) {
        if (p > 0) pdf.addPage();
        const srcY = y / ratio;
        const srcH = Math.min(ph / ratio, canvas.height - srcY);
        const pc = document.createElement("canvas");
        pc.width = canvas.width;
        pc.height = srcH;
        pc.getContext("2d").drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
        pdf.addImage(pc.toDataURL("image/png"), "PNG", 0, 0, pw, srcH * ratio);
        y += ph;
      }
      pdf.save(`${(cheatSheet.title || "cheatsheet").replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF exported!");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!cheatSheet) return <div className="text-center py-20 text-neutral-400">Cheat sheet not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <CheatSheetHeader cheatSheet={cheatSheet} onCopyAll={handleCopyAll} onExportMarkdown={handleExportMarkdown} onExportPDF={handleExportPDF} />
      <div ref={viewerRef}>
        <CheatSheetViewer cheatSheet={cheatSheet} onUpdate={setCheatSheet} />
      </div>
    </div>
  );
};

export default CheatSheetDetailPage;
