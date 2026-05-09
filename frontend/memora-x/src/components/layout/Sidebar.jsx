import React from "react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  BrainCircuit,
  BookOpen,
  ClipboardList,
  Users,
  X,
  Route,
  ScrollText,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", icon: LayoutDashboard, text: "Dashboard" },
    { to: "/documents", icon: FileText, text: "Documents" },
    { to: "/flashcards", icon: BookOpen, text: "Flashcards" },
    { to: "/quizzes", icon: ClipboardList, text: "Quizzes" },
    { to: "/cheatsheets", icon: ScrollText, text: "Cheat Sheets" },
    { to: "/study-planner", icon: Route, text: "Study Planner" },
    { to: "/community", icon: Users, text: "Community" },
    { to: "/profile", icon: User, text: "Profile" },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/70 z-40 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      <aside
        className={`fixed md:relative top-0 left-0 md:top-auto md:left-auto h-full w-64 bg-neutral-950 border-r border-neutral-800/80 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* {Logo and Close button for mobile} */}
        <div className="flex items-center h-16 px-5 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl
                    bg-primary
                    shadow-[0_0_20px_rgba(61,94,229,0.2)]"
            >
              <BrainCircuit
                className="text-white"
                size={18}
                strokeWidth={2.3}
              />
            </div>

            <h1 className="text-base font-bold tracking-tight text-white">
              MEMORA-X
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3.5 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-white border-l-2 border-primary ml-0"
                    : "text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={17}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={`transition-all duration-200 ${
                      isActive ? "text-primary" : "group-hover:text-neutral-300"
                    }`}
                  />
                  {link.text}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="px-3 py-4 border-t border-neutral-800/60">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 w-full px-3.5 py-2.5 text-[13px] font-medium text-neutral-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <LogOut
              size={17}
              strokeWidth={1.8}
              className="transition-all duration-200 group-hover:text-red-400"
            />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
