import React, { useState, useEffect } from "react";
import { FileText, ScrollText } from "lucide-react";
import cheatSheetService from "../../services/cheatSheetService";
import CheatSheetCard from "../../components/cheatSheets/CheatSheetCard";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CheatSheetsPage = () => {
  const [cheatSheets, setCheatSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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

  if (loading) return <Spinner label="Loading cheat sheets..." />;

  return (
    <div className="page-enter">
      <PageHeader 
        title="Cheat Sheets" 
        subtitle="Ultra-compressed, AI-powered revision notes"
      />

      {cheatSheets.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No cheat sheets yet"
          description="Open any document and use the AI Actions tab to generate your first cheat sheet."
          buttonText="Go to Documents"
          onActionClick={() => navigate("/documents")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {cheatSheets.map((cs) => (
            <CheatSheetCard key={cs._id} cheatSheet={cs} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CheatSheetsPage;
