import React, { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, Loader2, Globe } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function LoginPage({ onLogin, onGoogleLogin }) {
  const { t, language, toggleLanguage } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleGoogleCallback = useCallback(async (response) => {
    if (response.credential && onGoogleLogin) {
      setIsGoogleLoading(true);
      setError("");
      try {
        await onGoogleLogin(response.credential);
      } catch (err) {
        setError(err.message || "Google login failed");
      } finally {
        setIsGoogleLoading(false);
      }
    }
  }, [onGoogleLogin]);

  useEffect(() => {
    if (GOOGLE_CLIENT_ID && window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { 
          theme: "outline", 
          size: "large", 
          width: "100%",
          text: "continue_with",
        }
      );
    }
  }, [handleGoogleCallback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onLogin(formData, isLogin);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-4xl font-bold text-gray-900"
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Notu
            </h1>
            <span className="opacity-50 text-sm mt-1 block">
              {t('tagline')}
            </span>
          </div>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Globe size={16} />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                isLogin
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                !isLogin
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t('register')}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {GOOGLE_CLIENT_ID && (
            <>
              <div 
                id="google-signin-button" 
                className={`w-full mb-4 ${isGoogleLoading ? 'opacity-50 pointer-events-none' : ''}`}
              />
              
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    {t('orContinueWith')}
                  </span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder={t('name')}
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-gray-200 transition-all text-gray-700 placeholder-gray-400"
                required={!isLogin}
              />
            )}

            <input
              type="email"
              name="email"
              placeholder={t('email')}
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-gray-200 transition-all text-gray-700 placeholder-gray-400"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t('password')}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-gray-200 transition-all text-gray-700 placeholder-gray-400"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isLogin ? t('loggingIn') : t('registering')}</span>
                </>
              ) : (
                <span>{isLogin ? t('login') : t('register')}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
