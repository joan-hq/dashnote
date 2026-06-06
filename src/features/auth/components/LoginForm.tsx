"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { GoogleIcon } from "@/components/common/icons/GoogleIcon";

import dynamic from 'next/dynamic';


const NoteIcon = dynamic(
  () => import('@/components/common/icons/NoteIcon').then((mod) => mod.NoteIcon),
  { ssr: false }
);

export function LoginForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const errorType = params.get("error");
      if (errorType) {
        switch (errorType) {
          case "OAuthSignin": setErrorMessage("Could not initialize Google sign-in."); break;
          case "OAuthCallback": setErrorMessage("An error occurred during the Google callback."); break;
          case "OAuthCreateAccount": setErrorMessage("Failed to create user account."); break;
          default: setErrorMessage("An unexpected authentication error occurred."); break;
        }
      }
    }
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "380px",
        padding: "0 24px",
      }}>
        {/* Icon */}
        <NoteIcon width={120} height={120} style={{ marginBottom: "16px" }} />

        <p style={{
          fontSize: "22px",
          fontWeight: 600,
          color: "var(--primary)",
          marginBottom: "20px",
          marginTop: "10px",
        }}>
          DashNote
        </p>

        {/* Title */}
        <h1 style={{
          fontSize: "26px", fontWeight: 700,
          color: "var(--text-title)",
          marginBottom: "8px", textAlign: "center",
        }}>
          Log in
        </h1>
        <p style={{
          fontSize: "14px", color: "var(--text-secondary)",
          marginBottom: "36px", textAlign: "center", lineHeight: 1.6,
        }}>
          Sign in to access your DashNote knowledge base.
        </p>

        {/* Error */}
        {errorMessage && (
          <div style={{
            width: "100%",
            background: "#FEF2F2",
            border: "0.5px solid #FECACA",
            borderRadius: "var(--radius)",
            padding: "9px 12px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "7px",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: "12px", color: "#991B1B", lineHeight: 1.5 }}>
              {errorMessage}
            </span>
          </div>
        )}

        {/* Google button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "13px 16px",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border-card)",
            background: "var(--surface)",
            color: loading ? "var(--text-muted)" : "var(--text-title)",
            fontSize: "15px",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "var(--transition)",
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.background = "var(--ghost-hover)";
              e.currentTarget.style.borderColor = "var(--secondary-hover)";
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.borderColor = "var(--border-card)";
          }}
        >
          {loading ? (
            <span>Signing in…</span>
          ) : (
            <>
              <GoogleIcon width={16} height={16} />
              Continue with Google
            </>
          )}
        </button>

        <p style={{
          marginTop: "28px",
          fontSize: "12px",
          color: "var(--text-muted)",
          textAlign: "center",
          lineHeight: 1.6,
        }}>
          © 2026 DashNote
        </p>
      </div>
    </div>
  );
}
