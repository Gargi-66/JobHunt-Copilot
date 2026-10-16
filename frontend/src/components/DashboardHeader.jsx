import { useState, useRef, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

function DashboardHeader({
  applicationsCount = 0,
  activeTab = "dashboard",
  setActiveTab,
  onAddApplicationClick,
  theme,
  setTheme,
  onLogout,
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "applications", label: "Applications", icon: "📋" },
    { id: "job-listings", label: "Job Listings", icon: "💼" },
    { id: "interviews", label: "Interviews", icon: "💬" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "goals", label: "Goals", icon: "🎯" },
    { id: "cv-manager", label: "CV Manager", icon: "📄" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <header className="app-top-header">
      <div className="header-top-row">
        {/* Brand & Application Counter */}
        <div className="header-brand-group">
          <div
            className="header-brand"
            onClick={() => setActiveTab("dashboard")}
            role="button"
            tabIndex={0}
            title="Go to Dashboard"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setActiveTab("dashboard");
              }
            }}
          >
            <span className="brand-icon">✦</span>
            <span className="brand-name">Job Tracker</span>
          </div>

          <div
            className="header-counter-badge"
            title={`${applicationsCount} active ${
              applicationsCount === 1 ? "application" : "applications"
            } tracked`}
          >
            <span className="counter-num">{applicationsCount}</span>
            <span className="counter-label">
              {applicationsCount === 1 ? "Application" : "Applications"}
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="header-actions">
          <button
            type="button"
            className="header-add-button"
            onClick={onAddApplicationClick}
            title="Add a new job application"
          >
            <span className="add-icon">＋</span>
            <span className="add-text">Add Application</span>
          </button>

          {/* Profile Avatar & Dropdown */}
          <div className="profile-menu-container" ref={profileMenuRef}>
            <button
              type="button"
              className="profile-avatar-button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              aria-expanded={showProfileMenu}
              aria-label="User profile and settings"
              title="Profile & Settings"
            >
              <span className="avatar-icon">👤</span>
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-header">
                  <span className="user-role-badge">Signed In</span>
                  <div className="user-email-preview">Authenticated User</div>
                </div>

                <div className="dropdown-divider" />

                <div className="dropdown-theme-row">
                  <span className="dropdown-item-label">Appearance</span>
                  <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setActiveTab("profile");
                    setShowProfileMenu(false);
                  }}
                >
                  <span className="dropdown-icon">👤</span>
                  <span>View Profile</span>
                </button>

                <div className="dropdown-divider" />

                <button
                  type="button"
                  className="dropdown-item logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) {
                      onLogout();
                    }
                  }}
                >
                  <span className="dropdown-icon">🚪</span>
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="header-navbar" aria-label="Main Navigation">
        <ul className="nav-list">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-button ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.id === "applications" && applicationsCount > 0 && (
                    <span className="nav-pill-count">{applicationsCount}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

export default DashboardHeader;
