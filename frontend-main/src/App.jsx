import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import CommitListPage from "./pages/CommitListPage";
import DiffViewerPage from "./pages/DiffViewerPage";
import FileExplorerPage from "./pages/FileExplorerPage";
import RepoDashboardPage from "./pages/RepoDashboardPage";

export default function App() {
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
