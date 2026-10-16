import { useEffect, useMemo, useRef, useState } from "react";
import API_BASE_URL from "../config";
import DashboardHeader from "../components/DashboardHeader";

function Dashboard({ theme, setTheme, onLogout }) {
  // =========================================================
  // ACTIVE NAVIGATION TAB
  // =========================================================
  const [activeTab, setActiveTab] = useState("dashboard");

  // =========================================================
  // RESUME / CV STATE
  // =========================================================
  const [resumeText, setResumeText] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeSaving, setResumeSaving] = useState(false);
  const [resumeFeedback, setResumeFeedback] = useState({ message: "", type: "" });

  // =========================================================
  // APPLICATION STATE
  // =========================================================

  const [applications, setApplications] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("Applied");
  const [showForm, setShowForm] = useState(false);

  // Reference to the Add Application form
  const applicationFormRef = useRef(null);

  // =========================================================
  // SEARCH / FILTER / SORT
  // =========================================================

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // =========================================================
  // INTERVIEW PREP STATE
  // =========================================================

  const [interviewPrep, setInterviewPrep] = useState(null);
  const [preparingInterview, setPreparingInterview] =
    useState(false);
  const [interviewPrepError, setInterviewPrepError] =
    useState("");

  // =========================================================
  // LOADING STATE
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // =========================================================
  // JD ANALYZER STATE
  // =========================================================

  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  // =========================================================
  // FETCH RESUME
  // =========================================================

  const fetchResume = async () => {
    try {
      setResumeLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/resume`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load resume");
      }

      const data = await response.json();
      if (data && data.resume && data.resume.resume_text) {
        setResumeText(data.resume.resume_text);
      }
    } catch (err) {
      console.error("Error fetching resume:", err);
    } finally {
      setResumeLoading(false);
    }
  };

  const handleSaveResume = async () => {
    if (!resumeText.trim()) {
      setResumeFeedback({
        message: "Please enter your resume text before saving.",
        type: "error",
      });
      return;
    }

    try {
      setResumeSaving(true);
      setResumeFeedback({ message: "", type: "" });
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_BASE_URL}/resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resume_text: resumeText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save resume");
      }

      const data = await response.json();
      setResumeFeedback({
        message: data.message || "Resume saved successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Error saving resume:", err);
      setResumeFeedback({
        message: "Failed to save resume. Please ensure the backend is running.",
        type: "error",
      });
    } finally {
      setResumeSaving(false);
    }
  };

  // =========================================================
  // FETCH APPLICATIONS
  // =========================================================

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_BASE_URL}/applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();

      setApplications(data);
    } catch (error) {
      console.error(
        "Error fetching applications:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchResume();
  }, []);

  // =========================================================
  // SCROLL TO APPLICATION FORM
  // =========================================================

  useEffect(() => {
    if (!showForm) {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (applicationFormRef.current) {
          applicationFormRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }, [showForm]);

  // =========================================================
  // ADD APPLICATION
  // =========================================================

  const handleAddApplication = async (event) => {
    event.preventDefault();

    if (!company.trim() || !role.trim()) {
      return;
    }

    try {
      setAdding(true);

      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_BASE_URL}/applications`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            company: company,
            role: role,
            link: link,
            status: status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to create application"
        );
      }

      const data = await response.json();

      setApplications((previousApplications) => [
        ...previousApplications,
        data,
      ]);

      // Clear form
      setCompany("");
      setRole("");
      setLink("");
      setStatus("Applied");

      // Close form
      setShowForm(false);
    } catch (error) {
      console.error(
        "Error creating application:",
        error
      );
    } finally {
      setAdding(false);
    }
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleStatusChange = async (
    applicationId,
    newStatus
  ) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_BASE_URL}/applications/${applicationId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update application"
        );
      }

      const updatedApplication =
        await response.json();

      setApplications((previousApplications) =>
        previousApplications.map((application) =>
          application.id === applicationId
            ? updatedApplication
            : application
        )
      );
    } catch (error) {
      console.error(
        "Error updating application:",
        error
      );
    }
  };

  // =========================================================
  // DELETE APPLICATION
  // =========================================================

  const handleDeleteApplication = async (
    applicationId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_BASE_URL}/applications/${applicationId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete application"
        );
      }

      setApplications((previousApplications) =>
        previousApplications.filter(
          (application) =>
            application.id !== applicationId
        )
      );
    } catch (error) {
      console.error(
        "Error deleting application:",
        error
      );
    }
  };

  // =========================================================
  // JD ANALYZER
  // =========================================================

  const handleAnalyzeJD = async () => {
    if (!jobDescription.trim()) {
      setAnalysisError(
        "Please paste a job description first."
      );

      return;
    }

    try {
      setAnalyzing(true);

      setAnalysisError("");

      setAnalysis(null);

      // Clear previous interview preparation
      setInterviewPrep(null);
      setInterviewPrepError("");

      const response = await fetch(
        `${API_BASE_URL}/analyze-jd`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            job_description: jobDescription,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to analyze job description"
        );
      }

      const data = await response.json();

      setAnalysis(data);
    } catch (error) {
      console.error(
        "Error analyzing job description:",
        error
      );

      setAnalysisError(
        "Something went wrong while analyzing the job description."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // =========================================================
  // INTERVIEW PREP GENERATOR
  // =========================================================

  const handleInterviewPrep = async () => {
    if (!jobDescription.trim()) {
      setInterviewPrepError(
        "Please analyze a job description first."
      );

      return;
    }

    try {
      setPreparingInterview(true);

      setInterviewPrepError("");

      setInterviewPrep(null);

      const response = await fetch(
        `${API_BASE_URL}/interview-prep`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            job_description: jobDescription,

            company:
              analysis?.company || "Unknown",

            role:
              analysis?.role || "Unknown",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to generate interview preparation"
        );
      }

      const data = await response.json();

      setInterviewPrep(data);
    } catch (error) {
      console.error(
        "Error generating interview preparation:",
        error
      );

      setInterviewPrepError(
        "Something went wrong while generating interview preparation."
      );
    } finally {
      setPreparingInterview(false);
    }
  };

  // =========================================================
  // CREATE APPLICATION FROM AI ANALYSIS
  // =========================================================

  const handleCreateApplicationFromAnalysis =
    () => {
      if (!analysis) {
        return;
      }

      // Automatically fill company
      setCompany(analysis.company || "");

      // Automatically fill role
      setRole(analysis.role || "");

      // JD Analyzer does not provide a job link
      setLink("");

      // New applications start as Applied
      setStatus("Applied");

      // Open application form
      setShowForm(true);

      // Scroll to form
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (applicationFormRef.current) {
            applicationFormRef.current.scrollIntoView(
              {
                behavior: "smooth",
                block: "start",
              }
            );
          }
        });
      });
    };

  // =========================================================
  // STATISTICS
  // =========================================================

  const stats = useMemo(() => {
    return {
      total: applications.length,

      applied: applications.filter(
        (application) =>
          application.status === "Applied"
      ).length,

      interviewing: applications.filter(
        (application) =>
          application.status === "Interviewing"
      ).length,

      offers: applications.filter(
        (application) =>
          application.status === "Offer"
      ).length,

      rejected: applications.filter(
        (application) =>
          application.status === "Rejected"
      ).length,
    };
  }, [applications]);

  // =========================================================
  // FILTER + SEARCH + SORT
  // =========================================================

  const visibleApplications = useMemo(() => {
    let result = [...applications];

    // Filter by status
    if (filterStatus !== "All") {
      result = result.filter(
        (application) =>
          application.status === filterStatus
      );
    }

    // Search company / role
    if (search.trim()) {
      const searchValue =
        search.toLowerCase();

      result = result.filter(
        (application) =>
          application.company
            .toLowerCase()
            .includes(searchValue) ||
          application.role
            .toLowerCase()
            .includes(searchValue)
      );
    }

    // Sort by company
    if (sortBy === "company") {
      result.sort((a, b) =>
        a.company.localeCompare(b.company)
      );
    }

    // Sort by role
    if (sortBy === "role") {
      result.sort((a, b) =>
        a.role.localeCompare(b.role)
      );
    }

    // Newest first
    if (sortBy === "newest") {
      result.sort((a, b) => b.id - a.id);
    }

    // Oldest first
    if (sortBy === "oldest") {
      result.sort((a, b) => a.id - b.id);
    }

    return result;
  }, [
    applications,
    filterStatus,
    search,
    sortBy,
  ]);

  // =========================================================
  // BOARD GROUPING
  // =========================================================

  const getApplicationsByStatus = (
    statusName
  ) => {
    return visibleApplications.filter(
      (application) =>
        application.status === statusName
    );
  };

  // =========================================================
  // CIRCULAR GRAPH
  // =========================================================

  const progressPercentage =
    stats.total === 0
      ? 0
      : Math.round(
          ((stats.interviewing +
            stats.offers) /
            stats.total) *
            100
        );

  // =========================================================
  // COMPANY INITIAL
  // =========================================================

  const getInitial = (companyName) => {
    return companyName
      ? companyName.charAt(0).toUpperCase()
      : "?";
  };

  // =========================================================
  // APPLICATION CARD
  // =========================================================

  const ApplicationCard = ({
    application,
  }) => {
    return (
      <div className="application-card">
        <div className="application-card-top">
          <div className="company-avatar">
            {getInitial(application.company)}
          </div>

          <button
            className="delete-button"
            onClick={() =>
              handleDeleteApplication(
                application.id
              )
            }
            title="Delete application"
          >
            ×
          </button>
        </div>

        <div className="application-card-content">
          <h4>{application.company}</h4>

          <p className="application-role">
            {application.role}
          </p>

          {application.link && (
            <a
              href={application.link}
              target="_blank"
              rel="noreferrer"
              className="job-link"
            >
              View job ↗
            </a>
          )}
        </div>

        <div className="application-card-bottom">
          <select
            value={application.status}
            onChange={(event) =>
              handleStatusChange(
                application.id,
                event.target.value
              )
            }
            className={`status-select status-${application.status.toLowerCase()}`}
          >
            <option value="Applied">
              Applied
            </option>

            <option value="Interviewing">
              Interviewing
            </option>

            <option value="Offer">
              Offer
            </option>

            <option value="Rejected">
              Rejected
            </option>
          </select>
        </div>
      </div>
    );
  };

  // =========================================================
  // BOARD COLUMN
  // =========================================================

  const BoardColumn = ({
    title,
    statusName,
    icon,
  }) => {
    const columnApplications =
      getApplicationsByStatus(statusName);

    return (
      <div className="application-column">
        <div className="column-header">
          <div className="column-title">
            <span
              className={`column-icon ${statusName.toLowerCase()}`}
            >
              {icon}
            </span>

            <h3>{title}</h3>
          </div>

          <span className="application-count">
            {columnApplications.length}
          </span>
        </div>

        <div className="column-content">
          {columnApplications.length === 0 ? (
            <div className="empty-column">
              <div className="empty-icon">
                ✦
              </div>

              <p>
                No applications here
              </p>
            </div>
          ) : (
            columnApplications.map(
              (application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                />
              )
            )
          )}
        </div>
      </div>
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="dashboard">

      {/* =====================================================
          PERSISTENT TOP HEADER & NAVIGATION
      ===================================================== */}
      <DashboardHeader
        applicationsCount={stats.total}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddApplicationClick={() => {
          // Switch to dashboard tab and show form
          if (activeTab !== "dashboard" && activeTab !== "applications") {
            setActiveTab("dashboard");
          }
          setShowForm(true);
        }}
        theme={theme}
        setTheme={setTheme}
        onLogout={onLogout}
      />

      {/* =====================================================
          CV MANAGER VIEW
      ===================================================== */}
      {activeTab === "cv-manager" && (
        <section className="module-container">
          <div className="cv-manager-card">
            <div className="cv-manager-header">
              <div>
                <span className="placeholder-badge">DOCUMENT REPOSITORY</span>
                <h2 className="placeholder-title">CV / Resume Manager</h2>
                <p className="placeholder-description">
                  Manage your primary resume. This resume is stored securely in your database and powers AI Job Description analysis and tailoring.
                </p>
              </div>
              <button
                type="button"
                className="add-job-button"
                onClick={handleSaveResume}
                disabled={resumeSaving}
              >
                {resumeSaving ? "Saving..." : "Save Resume →"}
              </button>
            </div>

            {resumeLoading ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <p>Loading your saved resume...</p>
              </div>
            ) : (
              <>
                <textarea
                  className="cv-manager-textarea"
                  placeholder="Paste your plain text or Markdown resume content here (e.g. Work Experience, Skills, Education)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />

                <div className="cv-manager-actions">
                  <button
                    type="button"
                    className="save-application-button"
                    onClick={handleSaveResume}
                    disabled={resumeSaving}
                    style={{ width: "auto", minWidth: "160px" }}
                  >
                    {resumeSaving ? "Saving..." : "Save Resume →"}
                  </button>

                  {resumeFeedback.message && (
                    <span className={`cv-feedback-msg ${resumeFeedback.type}`}>
                      {resumeFeedback.message}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          JOB LISTINGS VIEW (HONEST ROADMAP PLACEHOLDER)
      ===================================================== */}
      {activeTab === "job-listings" && (
        <section className="module-container">
          <div className="placeholder-view-card">
            <span className="placeholder-badge">Roadmap Module</span>
            <div className="placeholder-icon">💼</div>
            <h2 className="placeholder-title">Job Listings</h2>
            <p className="placeholder-description">
              Direct job-board feed integration (LinkedIn, Indeed, remote boards) is currently scheduled for the next development phase. When live, you will be able to browse verified job openings and import them directly into your tracker with 1 click.
            </p>
            <div className="placeholder-features-grid">
              <div className="placeholder-feature-item">
                <h4>Verified Listings</h4>
                <p>Aggregated software, design, and product postings with direct apply links.</p>
              </div>
              <div className="placeholder-feature-item">
                <h4>1-Click Import</h4>
                <p>Add any listing straight into your Applications tracker without manual typing.</p>
              </div>
              <div className="placeholder-feature-item">
                <h4>Fit Scoring</h4>
                <p>AI compares requirements against your saved CV before you apply.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          GOALS VIEW (HONEST ROADMAP PLACEHOLDER)
      ===================================================== */}
      {activeTab === "goals" && (
        <section className="module-container">
          <div className="placeholder-view-card">
            <span className="placeholder-badge">Roadmap Module</span>
            <div className="placeholder-icon">🎯</div>
            <h2 className="placeholder-title">Application Goals & Targets</h2>
            <p className="placeholder-description">
              Weekly application targets and streak milestones will be backed by a persistent goals model in an upcoming milestone. Set your targets and maintain your search velocity.
            </p>
            <div className="placeholder-features-grid">
              <div className="placeholder-feature-item">
                <h4>Weekly Target</h4>
                <p>Set a target number of high-quality applications each week.</p>
              </div>
              <div className="placeholder-feature-item">
                <h4>Search Velocity</h4>
                <p>Track your submission rate and response turnaround times over time.</p>
              </div>
              <div className="placeholder-feature-item">
                <h4>Active Milestone</h4>
                <p>You have submitted <strong>{stats.total}</strong> total applications so far!</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          PROFILE VIEW
      ===================================================== */}
      {activeTab === "profile" && (
        <section className="module-container">
          <div className="profile-view-card">
            <span className="placeholder-badge">ACCOUNT OVERVIEW</span>
            <div className="placeholder-icon">👤</div>
            <h2 className="placeholder-title">User Account</h2>
            <p className="placeholder-description">
              Your session is authenticated and protected with a JSON Web Token (JWT).
            </p>
            <div className="placeholder-features-grid">
              <div className="placeholder-feature-item">
                <h4>Session Status</h4>
                <p>Active and securely verified with backend.</p>
              </div>
              <div className="placeholder-feature-item">
                <h4>Total Tracked</h4>
                <p>{stats.total} {stats.total === 1 ? "application" : "applications"}</p>
              </div>
              <div className="placeholder-feature-item">
                <h4>Appearance</h4>
                <p>Currently using {theme} mode.</p>
              </div>
            </div>

            <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
              <button
                type="button"
                className="add-job-button"
                onClick={onLogout}
                style={{ background: "#d93838", borderColor: "#b91c1c" }}
              >
                Log Out of Account
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          DASHBOARD WELCOME HEADER (Shown on dashboard tab)
      ===================================================== */}


      {/* =====================================================
          ADD APPLICATION FORM
      ===================================================== */}

      {showForm && (
        <section
          ref={applicationFormRef}
          className="add-application-panel"
        >
          <div className="form-panel-heading">
            <div>
              <span className="form-kicker">
                NEW APPLICATION
              </span>

              <h2>
                Add a new opportunity
              </h2>
            </div>

            <button
              className="close-form"
              onClick={() =>
                setShowForm(false)
              }
            >
              ×
            </button>
          </div>

          <form
            className="application-form"
            onSubmit={handleAddApplication}
          >
            <div className="form-field">
              <label>
                Company
              </label>

              <input
                type="text"
                placeholder="e.g. Google"
                value={company}
                onChange={(event) =>
                  setCompany(event.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label>
                Role
              </label>

              <input
                type="text"
                placeholder="e.g. Frontend Developer"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label>
                Job link
              </label>

              <input
                type="url"
                placeholder="https://..."
                value={link}
                onChange={(event) =>
                  setLink(event.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
              >
                <option value="Applied">
                  Applied
                </option>

                <option value="Interviewing">
                  Interviewing
                </option>

                <option value="Offer">
                  Offer
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="save-application-button"
              disabled={adding}
            >
              {adding
                ? "Adding..."
                : "Add application →"}
            </button>
          </form>
        </section>
      )}

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      {(activeTab === "dashboard" || activeTab === "analytics" || activeTab === "applications") && (
      <section className="stats-grid">

        <div className="stat-card total-stat">
          <div className="stat-card-top">
            <span>
              Total applications
            </span>

            <span className="stat-icon">
              ◈
            </span>
          </div>

          <strong>
            {stats.total}
          </strong>

          <p>
            Opportunities you're tracking
          </p>
        </div>

        <div className="stat-card interview-stat">
          <div className="stat-card-top">
            <span>
              Interviewing
            </span>

            <span className="stat-icon">
              ◎
            </span>
          </div>

          <strong>
            {stats.interviewing}
          </strong>

          <p>
            Conversations in progress
          </p>
        </div>

        <div className="stat-card offer-stat">
          <div className="stat-card-top">
            <span>
              Offers
            </span>

            <span className="stat-icon">
              ✦
            </span>
          </div>

          <strong>
            {stats.offers}
          </strong>

          <p>
            Offers received
          </p>
        </div>

        <div className="stat-card rejected-stat">
          <div className="stat-card-top">
            <span>
              Rejected
            </span>

            <span className="stat-icon">
              ↘
            </span>
          </div>

          <strong>
            {stats.rejected}
          </strong>

          <p>
            Part of the journey
          </p>
        </div>

      </section>
      )}

      {/* =====================================================
          ANALYTICS: PIPELINE PROGRESSION
      ===================================================== */}

      {activeTab === "analytics" && (
      <section className="analytics-grid">

        {/* ===================================================
            PROGRESS
        =================================================== */}

        <div className="analytics-card progress-card">

          <div className="analytics-heading">
            <div>
              <span className="section-kicker">
                PROGRESS
              </span>

              <h2>
                Your pipeline
              </h2>
            </div>
          </div>

          <div className="progress-content">

            <div
              className="progress-circle"
              style={{
                "--progress": `${progressPercentage * 3.6}deg`,
              }}
            >
              <div className="progress-circle-inner">
                <strong>
                  {progressPercentage}%
                </strong>

                <span>
                  progressing
                </span>
              </div>
            </div>

            <div className="progress-copy">

              <h3>
                Keep going ✨
              </h3>

              <p>
                {stats.interviewing +
                  stats.offers}{" "}
                of your {stats.total}{" "}
                applications have moved
                beyond the initial
                application stage.
              </p>

              <div className="mini-progress">
                <span
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>

            </div>

          </div>
        </div>

      </section>
      )}

      {/* =====================================================
          INTERVIEWS: AI JD ANALYZER & INTERVIEW PREP
      ===================================================== */}

      {activeTab === "interviews" && (
      <section className="analytics-grid">

        {/* ===================================================
            JD ANALYZER
        =================================================== */}

        <div className="analytics-card overview-card">

          <div className="analytics-heading">
            <div>
              <span className="section-kicker">
                AI POWERED
              </span>

              <h2>
                JD Analyzer
              </h2>
            </div>
          </div>

          {/* JD INPUT */}

          <div className="jd-analyzer">

            <textarea
              className="jd-texta