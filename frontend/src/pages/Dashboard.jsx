import { useEffect, useMemo, useRef, useState } from "react";

function Dashboard() {
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
  // FETCH APPLICATIONS
  // =========================================================

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "https://job-hunt-copilot-backend.onrender.com/applications",
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
        "https://job-hunt-copilot-backend.onrender.com/applications",
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
        `https://job-hunt-copilot-backend.onrender.com/applications/${applicationId}`,
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
        `https://job-hunt-copilot-backend.onrender.com/applications/${applicationId}`,
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
        "https://job-hunt-copilot-backend.onrender.com/analyze-jd",
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
        "https://job-hunt-copilot-backend.onrender.com/interview-prep",
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
          HEADER
      ===================================================== */}

      <header className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">
            YOUR JOB SEARCH
          </div>

          <h1>
            Welcome back! <span>👋</span>
          </h1>

          <p>
            Keep your applications organized.
            Your next opportunity is out there.
          </p>
        </div>

        <button
          className="add-job-button"
          onClick={() =>
            setShowForm(!showForm)
          }
        >
          <span>＋</span>
          Add application
        </button>
      </header>

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

      {/* =====================================================
          ANALYTICS
      ===================================================== */}

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
              className="jd-textarea"
              placeholder="Paste a job description here..."
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(
                  event.target.value
                )
              }
            />

            <button
              className="analyze-jd-button"
              onClick={handleAnalyzeJD}
              disabled={analyzing}
            >
              {analyzing
                ? "Analyzing..."
                : "Analyze JD →"}
            </button>

            {analysisError && (
              <p className="analysis-error">
                {analysisError}
              </p>
            )}

          </div>

          {/* =================================================
              AI RESULT
          ================================================= */}

          {analysis && (
            <div className="analysis-results">

              {/* COMPANY */}

              <div className="analysis-result-section">
                <span className="analysis-label">
                  COMPANY
                </span>

                <strong className="seniority-value">
                  {analysis.company ||
                    "Not detected"}
                </strong>
              </div>

              {/* ROLE */}

              <div className="analysis-result-section">
                <span className="analysis-label">
                  ROLE
                </span>

                <strong className="seniority-value">
                  {analysis.role ||
                    "Not detected"}
                </strong>
              </div>

              {/* REQUIRED SKILLS */}

              <div className="analysis-result-section">
                <span className="analysis-label">
                  REQUIRED SKILLS
                </span>

                <div className="skills-list">

                  {analysis.required_skills &&
                  analysis.required_skills.length >
                    0 ? (
                    analysis.required_skills.map(
                      (skill, index) => (
                        <span
                          className="skill-tag"
                          key={index}
                        >
                          {skill}
                        </span>
                      )
                    )
                  ) : (
                    <p>
                      No specific skills detected.
                    </p>
                  )}

                </div>
              </div>

              {/* SENIORITY */}

              <div className="analysis-result-section">
                <span className="analysis-label">
                  SENIORITY
                </span>

                <strong className="seniority-value">
                  {analysis.seniority ||
                    "Not detected"}
                </strong>
              </div>

              {/* RED FLAGS */}

              <div className="analysis-result-section">
                <span className="analysis-label">
                  RED FLAGS
                </span>

                {analysis.red_flags &&
                analysis.red_flags.length >
                  0 ? (
                  <ul className="red-flags-list">
                    {analysis.red_flags.map(
                      (flag, index) => (
                        <li key={index}>
                          {flag}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="no-red-flags">
                    No red flags detected.
                  </p>
                )}
              </div>

              {/* =================================================
                  INTERVIEW PREP BUTTON
              ================================================= */}

              <div className="interview-prep-section">

                <button
                  className="interview-prep-button"
                  onClick={handleInterviewPrep}
                  disabled={preparingInterview}
                >
                  {preparingInterview
                    ? "Generating interview prep..."
                    : "Prepare for Interview →"}
                </button>

                {interviewPrepError && (
                  <p className="analysis-error">
                    {interviewPrepError}
                  </p>
                )}

                {/* =================================================
                    INTERVIEW PREP RESULTS
                ================================================= */}

                {interviewPrep && (
                  <div className="interview-prep-results">

                    <div className="interview-prep-heading">

                      <span className="analysis-label">
                        INTERVIEW PREPARATION
                      </span>

                      <h3>
                        Likely questions for this role
                      </h3>

                    </div>

                    {interviewPrep.questions &&
                      interviewPrep.questions.map(
                        (item, index) => (
                          <div
                            className="interview-question"
                            key={index}
                          >

                            <h4>
                              {index + 1}.{" "}
                              {item.question}
                            </h4>

                            <ul>
                              {item.talking_points &&
                                item.talking_points.map(
                                  (
                                    point,
                                    pointIndex
                                  ) => (
                                    <li
                                      key={
                                        pointIndex
                                      }
                                    >
                                      {point}
                                    </li>
                                  )
                                )}
                            </ul>

                          </div>
                        )
                      )}

                  </div>
                )}

              </div>

              {/* =================================================
                  CREATE APPLICATION
              ================================================= */}

              <button
                className="create-application-button"
                onClick={
                  handleCreateApplicationFromAnalysis
                }
              >
                Create Application →
              </button>

            </div>
          )}

        </div>

      </section>

      {/* =====================================================
          APPLICATIONS HEADER
      ===================================================== */}

      <section className="applications-section">

        <div className="applications-heading">

          <div>
            <span className="section-kicker">
              TRACKER
            </span>

            <h2>
              Applications
            </h2>
          </div>

          <span className="total-badge">
            {visibleApplications.length}{" "}
            {visibleApplications.length === 1
              ? "application"
              : "applications"}
          </span>

        </div>

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div className="toolbar">

          <div className="search-wrapper">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search company or role..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

          <select
            value={filterStatus}
            onChange={(event) =>
              setFilterStatus(event.target.value)
            }
            className="toolbar-select"
          >
            <option value="All">
              All statuses
            </option>

            <option value="Applied">
              Applied
            </option>

            <option value="Interviewing">
              Interviewing
            </option>

            <option value="Offer">
              Offers
            </option>

            <option value="Rejected">
              Rejected
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
            className="toolbar-select"
          >
            <option value="newest">
              Newest
            </option>

            <option value="oldest">
              Oldest
            </option>

            <option value="company">
              Company A–Z
            </option>

            <option value="role">
              Role A–Z
            </option>
          </select>

        </div>

        {/* =================================================
            BOARD
        ================================================= */}

        {loading ? (
          <div className="loading-state">

            <div className="loading-spinner" />

            <p>
              Loading your applications...
            </p>

          </div>
        ) : (
          <div className="application-board">

            <BoardColumn
              title="Applied"
              statusName="Applied"
              icon="↗"
            />

            <BoardColumn
              title="Interviewing"
              statusName="Interviewing"
              icon="◎"
            />

            <BoardColumn
              title="Offer"
              statusName="Offer"
              icon="✦"
            />

            <BoardColumn
              title="Rejected"
              statusName="Rejected"
              icon="↘"
            />

          </div>
        )}

      </section>

    </div>
  );
}

export default Dashboard;