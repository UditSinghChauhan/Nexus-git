import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import useVcsRealtime from "../../hooks/useVcsRealtime";

const NAV = [
  { to: "/", label: "Dashboard", icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>) },
  { to: "/files", label: "Files", icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>) },
  { to: "/commits", label: "Commits", icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><line x1="1.05" y1="12" x2="7" y2="12" /><line x1="17.01" y1="12" x2="22.96" y2="12" /></svg>) },
  { to: "/diff", label: "Diff Viewer", icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>) },
];

const GithubIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>);
const LogoutIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>);

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const noop = useCallback(() => {}, []);

  useVcsRealtime(noop, {
    onConnect: useCallback(() => setIsConnected(true), []),
    onDisconnect: useCallback(() => setIsConnected(false), []),
  });

  function handleLogout() {
    setAuth(null);
    navigate("/login", { replace: true });
  }

  const initials = auth?.username ? auth.username.slice(0, 2).toUpperCase() : "?";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <aside style={{ width: "248px", flexShrink: 0, display: "flex", flexDirection: "column", background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-subtle)", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40 }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Nexus</div>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>vcs</div>
            </div>
          </div>
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "7px" }}>
            <span className="live-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0, background: isConnected ? "var(--accent-emerald)" : "var(--text-muted)", display: "inline-block" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: isConnected ? "var(--accent-emerald)" : "var(--text-muted)" }}>
              {isConnected ? "Live \u2014 Realtime sync active" : "Connecting\u2026"}
            </span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", padding: "6px 10px 10px" }}>Repository</p>
          {NAV.map((item) => {
            const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", marginBottom: "2px", textDecoration: "none", fontWeight: isActive ? 700 : 500, fontSize: "13.5px", color: isActive ? "var(--text-primary)" : "var(--text-secondary)", background: isActive ? "rgba(99,102,241,0.12)" : "transparent", transition: "background 0.15s, color 0.15s" }}>
                <span style={{ color: isActive ? "var(--accent-indigo)" : "var(--text-muted)", flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", marginBottom: "10px", background: "var(--bg-muted)" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "white", flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{auth?.username || "User"}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Authenticated</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <a href="https://github.com/UditSinghChauhan/Nexus-git" target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px", borderRadius: "7px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", background: "var(--bg-muted)", border: "1px solid var(--border-subtle)", textDecoration: "none" }}>
              <GithubIcon /> GitHub
            </a>
            <button type="button" onClick={handleLogout} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px", borderRadius: "7px", fontSize: "12px", fontWeight: 600, color: "#f43f5e", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", cursor: "pointer" }}>
              <LogoutIcon /> Logout
            </button>
          </div>
        </div>
      </aside>
      <main style={{ marginLeft: "248px", flex: 1, padding: "36px 40px", maxWidth: "100%", overflowX: "hidden" }}>{children}</main>
    </div>
  );
}