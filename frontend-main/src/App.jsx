import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import AppShell from "./components/layout/AppShell";
import { useAuth } from "./authContext";
import CommitListPage from "./pages/CommitListPage";
import DiffViewerPage from "./pages/DiffViewerPage";
import FileExplorerPage from "./pages/FileExplorerPage";
import RepoDashboardPage from "./pages/RepoDashboardPage";

function ProtectedApp() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<RepoDashboardPage />} />
        <Route path="/files" element={<FileExplorerPage />} />
        <Route path="/commits" element={<CommitListPage />} />
        <Route path="/commits/:hash" element={<CommitListPage />} />
        <Route path="/diff" element={<DiffViewerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
      />
      <Route
        path="/*"
        element={isAuthenticated ? <ProtectedApp /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
