import { useState, useEffect } from "react";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  // =========================
  // THEME STATE
  // =========================

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  // =========================
  // LOGIN STATE
  // =========================
  // We check localStorage when the app starts.
  // If access_token exists, the user is considered logged in.
  //
  // IMPORTANT:
  // AuthForm will now store the token using the SAME key:
  // "access_token"

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  // =========================
  // SAVE THEME
  // =========================

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    
    localStorage.removeItem("access_token");

    localStorage.removeItem("token");

    // Send the user back to the authentication screen
    setIsLoggedIn(false);
  };

  // =========================
  // APP UI
  // =========================

  return (
    <div className={`app ${theme}`}>

      {isLoggedIn ? (
        <>
          {/* =========================
              DASHBOARD CONTROLS
          ========================= */}

          <div className="dashboard-top-controls">

            <ThemeToggle
              theme={theme}
              setTheme={setTheme}
            />

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Log out
            </button>

          </div>

          {/* =========================
              DASHBOARD
          ========================= */}

          <Dashboard
            theme={theme}
            setTheme={setTheme}
            setIsLoggedIn={setIsLoggedIn}
          />
        </>
      ) : (
        <Auth
          theme={theme}
          setTheme={setTheme}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}

    </div>
  );
}

export default App;