import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CommitListPage from "./CommitListPage";
import DiffViewerPage from "./DiffViewerPage";
import FileExplorerPage from "./FileExplorerPage";

const apiMocks = vi.hoisted(() => ({
  fetchCommits: vi.fn(),
  fetchCommitDetails: vi.fn(),
  fetchDiff: vi.fn(),
  explainDiffWithAI: vi.fn(),
  fetchFiles: vi.fn(),
  fetchFileContent: vi.fn(),
  suggestCommitMessage: vi.fn(),
}));

vi.mock("../api/vcs", () => apiMocks);
vi.mock("../hooks/useVcsRealtime", () => ({
  default: () => {},
}));

function renderWithRoute(element, route = "/") {
  return render(
    <React.Fragment>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={element} />
          <Route path="/commits" element={element} />
        </Routes>
      </MemoryRouter>
    </React.Fragment>
  );
}

describe("showcase empty states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a clear empty state when no commits exist", async () => {
    apiMocks.fetchCommits.mockResolvedValue([]);

    renderWithRoute(<CommitListPage />, "/commits");

    await waitFor(() => {
      expect(
        screen.getByText(/No commits exist yet\. Create your first commit/i)
      ).toBeInTheDocument();
    });
  });

  it("shows a clear empty state when diff history is too small", async () => {
    apiMocks.fetchCommits.mockResolvedValue([{ hash: "abc123", message: "init" }]);

    renderWithRoute(<DiffViewerPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Diff view needs at least two commits/i)
      ).toBeInTheDocument();
    });
  });

  it("shows a clear empty state when no files are tracked", async () => {
    apiMocks.fetchFiles.mockResolvedValue([]);

    renderWithRoute(<FileExplorerPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/No tracked files are available yet/i)
      ).toBeInTheDocument();
    });
  });
});
