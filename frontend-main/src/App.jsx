import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import LoadingState from "./components/shared/LoadingState";
import { useAuth } from "./authContext";

const Login = lazy(() => import("./components/auth/Login"));
const Signup = lazy(() => import("./components/auth/Signup"));
const CommitListPage = lazy(() => import("./pages/CommitListPage"));
const DiffViewerPage = lazy(() => import("./pages/DiffViewerPage"));
const FileExplorerPage = lazy(() => import("./pages/FileExplorerPage"));
const RepoDashboardPage = lazy(() => import("./pages/RepoDashboardPage"));

function RouteFallback() {
  return <LoadingState label="Loading page..." />;
}

function ProtectedApp() {
  return (
    <AppShell>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<RepoDashboardPage />} />
          <Route path="/files" element={<FileExplorerPage />} />
          <Route path="/commits" element={<CommitListPage />} />
          <Route path="/commits/:hash" element={<CommitListPage />} />
          <Route path="/diff" element={<DiffViewerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  );
}
