function ThemeToggle({ theme, setTheme }) {
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className="theme-toggle"
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      title={`Switch to ${isLight ? "dark" : "light"} mode`}
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  );
}

export default ThemeToggle;
