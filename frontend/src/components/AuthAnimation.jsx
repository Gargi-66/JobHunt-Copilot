
import { useEffect, useState } from "react";
import "./AuthMascot.css";

const MOOD_CONTENT = {
  happy: {
    message: "Ready for your next adventure?",
    label: "CAREER COMPANION",
  },

  excited: {
    message: "YAY! You're joining the team!",
    label: "NEW ADVENTURE UNLOCKED",
  },

  loading: {
    message: "One tiny second…",
    label: "WORKING ON IT",
  },

  sad: {
    message: "Uh-oh… something went wrong.",
    label: "LET'S TRY AGAIN",
  },

  success: {
    message: "YOU'RE IN!",
    label: "MISSION ACCOMPLISHED",
  },
};

function AuthAnimation({ theme }) {
  const [mood, setMood] = useState("happy");

  useEffect(() => {
    const handleMoodChange = (event) => {
      const nextMood = event.detail;

      if (MOOD_CONTENT[nextMood]) {
        setMood(nextMood);
      }
    };

    window.addEventListener("auth-mood", handleMoodChange);

    return () => {
      window.removeEventListener("auth-mood", handleMoodChange);
    };
  }, []);

  const content = MOOD_CONTENT[mood];

  return (
    <div className={`animation-panel ${theme} mood-${mood}`}>
      <div className="mascot-background">
        <span className="floating-decoration decoration-one">✦</span>
        <span className="floating-decoration decoration-two">♡</span>
        <span className="floating-decoration decoration-three">✦</span>
        <span className="floating-decoration decoration-four">•</span>
        <span className="floating-decoration decoration-five">♡</span>
        <span className="floating-decoration decoration-six">✦</span>
      </div>

      <div className="career-companion-copy">
        <span className="companion-label">
          {content.label}
        </span>

        <h2>
          {theme === "light"
            ? "Your career adventure starts here."
            : "CAREER COPILOT: ONLINE"}
        </h2>

       
      </div>

      <div className="copilot-visual">
        <div className="mascot-glow" />

        <div className="career-mascot" aria-label="Career companion mascot">
          <div className="mascot-ear mascot-ear-left" />
          <div className="mascot-ear mascot-ear-right" />

          <div className="mascot-head">
            <div className="mascot-face-patch" />

            <div className="mascot-eye mascot-eye-left">
              <span />
            </div>

            <div className="mascot-eye mascot-eye-right">
              <span />
            </div>

            <div className="mascot-nose" />

            <div className="mascot-mouth">
              <span />
            </div>

            <div className="mascot-cheek mascot-cheek-left" />
            <div className="mascot-cheek mascot-cheek-right" />
          </div>

          <div className="mascot-neck" />

          <div className="mascot-body">
            <div className="mascot-collar">
              <span>✦</span>
            </div>

            <div className="mascot-arm mascot-arm-left">
              <span />
            </div>

            <div className="mascot-arm mascot-arm-right">
              <span />
            </div>
          </div>

          <div className="mascot-foot mascot-foot-left" />
          <div className="mascot-foot mascot-foot-right" />

          <div className="mascot-briefcase">
            <span>CV</span>
          </div>
        </div>
      </div>

      <div className="mascot-speech">
        <span className="speech-dot" />
        <span className="speech-text">{content.message}</span>
      </div>
    </div>
  );
}

export default AuthAnimation;