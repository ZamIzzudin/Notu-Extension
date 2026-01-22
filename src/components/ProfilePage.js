import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Loader2, Lock, Unlock } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import apiService from "../services/api";

export default function ProfilePage({ user, onBack, onUpdate, darkMode }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    isPrivate: user?.isPrivate || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        isPrivate: user.isPrivate || false,
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const data = await apiService.updateProfile(formData);
      onUpdate(data.user);
      setSuccess(t("saveChanges") + " ✓");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textColor = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-50";

  return (
    <div className={`w-full min-h-screen ${bgColor} p-6`}>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2">
          <ArrowLeft size={24} className={textColor} />
        </button>
        <h1 className={`text-2xl font-bold ${textColor}`}>{t("editProfile")}</h1>
      </div>

      <div className={`${cardBg} rounded-2xl p-6 shadow-sm`}>
        <div className="flex flex-col items-center mb-6">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
              darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase() || <User size={40} />
            )}
          </div>
          <p className={`mt-3 ${textMuted}`}>{user?.email}</p>
          {user?.authProvider === "google" && (
            <span className="mt-1 text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
              Google Account
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>
              {t("name")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-4 py-3 ${inputBg} rounded-xl outline-none focus:ring-2 focus:ring-gray-200 ${textColor}`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>
              {t("bio")}
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value.substring(0, 200) })
              }
              placeholder={t("bioPlaceholder")}
              className={`w-full px-4 py-3 ${inputBg} rounded-xl outline-none focus:ring-2 focus:ring-gray-200 ${textColor} resize-none`}
              rows={3}
              maxLength={200}
            />
            <p className={`text-xs ${textMuted} mt-1`}>
              {formData.bio.length}/200
            </p>
          </div>

          <div
            className={`flex items-center justify-between p-4 ${inputBg} rounded-xl`}
          >
            <div className="flex items-center gap-3">
              {formData.isPrivate ? (
                <Lock size={20} className={textColor} />
              ) : (
                <Unlock size={20} className={textColor} />
              )}
              <div>
                <p className={`font-medium ${textColor}`}>{t("privateProfile")}</p>
                <p className={`text-sm ${textMuted}`}>{t("privateProfileDesc")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, isPrivate: !formData.isPrivate })
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.isPrivate ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  formData.isPrivate ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t("saving")}</span>
              </>
            ) : (
              <span>{t("saveChanges")}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
