import React, { useState, useEffect } from "react";
import { FileText, ScrollText } from "lucide-react";
import cheatSheetService from "../../services/cheatSheetService";
import CheatSheetCard from "../../components/cheatSheets/CheatSheetCard";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";

const CheatSheetsPage = () => {
  const [cheatSheets, setCheatSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  // This page doesn't have a single documentId — we'd need a
  // backend endpoint for "all user cheat sheets". For now, show
  // a placeholder that redirects users to generate from documents.

  useEffect(() => {
    // We'll use a simple approach: fetch is not available for "all" yet.
    // The page serves as a landing page directing users to documents.
    setLoading(false);
  }, []);

  const handleDelete = async (id) => {
    try {
      await cheatSheetService.deleteCheatSheet(id);
      setCheatSheets((prev) => prev.filter((cs) => cs._id !== id));
      toast.success("Cheat sheet deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div>
      <PageHeader title="Cheat Sheets" />

      {cheatSheets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center mb-4">
            <ScrollText className="w-7 h-7 text-neutral-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No cheat sheets yet</h3>
          <p className="text-sm text-neutral-500 max-w-sm">
            Open any document and use the AI Actions tab to generate your first cheat sheet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {cheatSheets.map((cs) => (
            <CheatSheetCard key={cs._id} cheatSheet={cs} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CheatSheetsPage;
