function AuthAnimation({ theme }) {
    return (
        <div className={`animation-panel ${theme}`}>
            <h2>{theme === "light" ? "Your career adventure starts here." : "CAREER COPILOT: ONLINE"}</h2>
            <p>{theme === "light" ? "I'll handle the boring bits. You handle the ambition." : "Scanning the job universe..."}</p>
            <div className="copilot-visual">
            <span className="copilot-icon">✦</span>
            </div>
            
       </div>
    );

}  

export default AuthAnimation;

