import { useState } from "react";

function AuthForm({ isLogin, setIsLogin, setIsLoggedIn }) {
  // =========================
  // FORM STATE
  // =========================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error message shown to the user
  const [error, setError] = useState("");

  // Success message shown after signup
  const [success, setSuccess] = useState("");

  // =========================
  // HANDLES SIGNUP
  // =========================

  const handleSignup = async (event) => {
    event.preventDefault();

    // Clear previous messages
    setError("");
    setSuccess("");

    // Remove accidental spaces from the email
    const cleanEmail = email.trim().toLowerCase();

    // =========================
    // FRONTEND VALIDATION
    // =========================

    if (!cleanEmail || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(
        "https://job-hunt-copilot-backend.onrender.com/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Signup response:", data);

      // =========================
      // SIGNUP FAILED
      // =========================

      if (!response.ok) {
        setError(
          data.detail || "Could not create your account."
        );
        return;
      }

      // =========================
      // SIGNUP SUCCESS
      // =========================

      setSuccess(
        "Account created successfully! You can now log in."
      );

      // Clear password
      setPassword("");

      // Automatically switch to login
      setIsLogin(true);

    } catch (err) {
      console.error("Signup error:", err);

      setError(
        "Could not connect to the server. Make sure your backend is running."
      );
    }
  };

  // =========================
  // HANDLES LOGIN
  // =========================

  const handleLogin = async (event) => {
    event.preventDefault();

    // Clear previous messages
    setError("");
    setSuccess("");

    // Remove accidental spaces from the email
    const cleanEmail = email.trim().toLowerCase();

    // =========================
    // FRONTEND VALIDATION
    // =========================

    if (!cleanEmail || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      // OAuth2PasswordRequestForm expects:
      // username
      // password

      const formData = new URLSearchParams();

      formData.append("username", cleanEmail);
      formData.append("password", password);

      const response = await fetch(
        "https://job-hunt-copilot-backend.onrender.com/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: formData,
        }
      );

      const data = await response.json();

      console.log("STATUS:", response.status);
      console.log("LOGIN DATA:", data);

      // =========================
      // LOGIN FAILED
      // =========================

      if (!response.ok) {
        setError(
          data.detail || "Invalid email or password."
        );
        return;
      }

      // =========================
      // LOGIN SUCCESS
      // =========================

      // IMPORTANT:
      // Use "access_token", NOT "token".
      //
      // App.jsx checks for this same key.

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // Remove the old key from the previous version
      localStorage.removeItem("token");

      // Tell App.jsx that login succeeded
      setIsLoggedIn(true);

      console.log("Login successful.");

    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Could not connect to the server. Make sure your backend is running."
      );
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="auth-form">

      {/* =========================
          ERROR MESSAGE
      ========================= */}

      {error && (
        <p className="auth-error">
          {error}
        </p>
      )}

      {/* =========================
          SUCCESS MESSAGE
      ========================= */}

      {success && (
        <p className="auth-success">
          {success}
        </p>
      )}

      {/* =========================
          LOGIN
      ========================= */}

      {isLogin ? (
        <>
          <h1>Back already? 👀</h1>

          <p>Your career copilot missed you.</p>

          <p>Let's get back to the grind.</p>

          <form onSubmit={handleLogin}>

            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

            <button type="submit">
              Sign in →
            </button>

          </form>

          <p className="auth-switch">
            New here?

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setIsLogin(false);
              }}
            >
              Create one
            </button>
          </p>
        </>
      ) : (

        /* =========================
           SIGNUP
        ========================= */

        <>
          <h1>Create your account ✨</h1>

          <p>Let's get your career journey started.</p>

          <form onSubmit={handleSignup}>

            <label>Name</label>

            <input
              type="text"
              placeholder="Your name"
            />

            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

            <button type="submit">
              Create account →
            </button>

          </form>

          <p className="auth-switch">
            Already have an account?

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setIsLogin(true);
              }}
            >
              Log in
            </button>
          </p>
        </>
      )}

    </div>
  );
}

export default AuthForm;