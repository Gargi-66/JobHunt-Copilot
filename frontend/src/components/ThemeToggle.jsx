function ThemeToggle({ theme, setTheme }) {
    return (
      <button
        type="button"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="theme-toggle"
       >
        {theme === "light" ? "🌙" : "☀️"}
       </button> 
    );
}

export default ThemeToggle;
