import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../api/client";
import { useAuth } from "../../authContext";

const GitBranchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
);

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      setLoading(true);
      const res = await apiClient.post("/user/signup", { email, password, username });
      setAuth(res.data);
      navigate("/", { replace: true });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "#0f1521",
    border: "1px solid rgba(99,120,167,0.25)",
    borderRadius: "8px",
    padding: "11px 14px",
    color: "#e2e8f5",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0d14", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", marginBottom: "16px" }}>
            <GitBranchIcon />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#e2e8f5", margin: 0, letterSpacing: "-0.02em" }}>Nexus</h1>
          <p style={{ color: "#566380", marginTop: "6px", fontSize: "13px" }}>Version Control System</p>
        </div>

        {/* Card */}
        <div style={{ background: "#131929", border: "1px solid rgba(99,120,167,0.18)", borderRadius: "16px", padding: "32px" }}>
          <h2 style={{ color: "#e2e8f5", fontSize: "18px", fontWeight: 700, marginTop: 0, marginBottom: "24px" }}>Create account</h2>

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#8b9ec7", letterSpacing: "0.05em", marginBottom: "6px" }}>Username</label>
              <input
                id="signup-username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = "rgba(99,120,167,0.25)"}
                placeholder="johndoe"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#8b9ec7", letterSpacing: "0.05em", marginBottom: "6px" }}>Email address</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = "rgba(99,120,167,0.25)"}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#8b9ec7", letterSpacing: "0.05em", marginBottom: "6px" }}>Password</label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = "rgba(99,120,167,0.25)"}
                placeholder="Min. 8 characters"
              />
            </div>

            {errorMsg && (
              <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "8px", padding: "10px 14px", color: "#f43f5e", fontSize: "13px" }}>
                {errorMsg}
              </div>
            )}

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                background: loading ? "#1e2d45" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginTop: "4px",
              }}
            >
              {loading ? "Creating account…" : "Create account →"}
            </button>
          </form>

          <p style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "#566380" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
