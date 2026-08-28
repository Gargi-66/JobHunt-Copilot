import { useEffect, useState } from "react";

import AuthForm from "../components/AuthForm";
import AuthAnimation from "../components/AuthAnimation";
import ThemeToggle from "../components/ThemeToggle";



function Auth({ theme, setTheme, setIsLoggedIn })  {

  const [showIntro, setShowIntro] = useState(true);

  const [isLogin, setIsLogin] = useState(true);

 

  useEffect(() => {

    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };

  }, []);

  return (
    <main className="auth-page">

      {showIntro ? (

        <div className="intro-screen">
           
          <h1>Hey, future you! ✨</h1>
         
        </div>

      ) : (

        <>
          <ThemeToggle
            theme={theme}
            setTheme={setTheme}
          />

          <section
            className={`auth-container ${
              isLogin ? "login-mode" : "signup-mode"
            }`}
          >

            <AuthAnimation theme={theme} />

            
             <AuthForm
             isLogin={isLogin}
             setIsLogin={setIsLogin}
             setIsLoggedIn={setIsLoggedIn}
           />

          </section>
        </>

      )}

    </main>
  );
}

export default Auth;