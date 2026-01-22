import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Search,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Check,
  X,
  Loader2,
  User,
  Heart,
  Copy,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import apiService from "../services/api";

export default function FriendsPage({ onBack, darkMode, onViewProfile }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const loadFriends = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getFriends();
      setFriends(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFriendRequests = useCallback(async () => {
    try {
      const data = await apiService.getFriendRequests();
      setFriendRequests(data);
    } catch (err) {
      console.error("Failed to load friend requests:", err);
    }
  }, []);

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, [loadFriends, loadFriendRequests]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await apiService.searchUsers(query);
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await apiService.sendFriendRequest(userId);
      setSearchResults(
        searchResults.map((u) =>
          u.id === userId ? { ...u, isPending: true } : u
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await apiService.acceptFriendRequest(userId);
      setFriendRequests(friendRequests.filter((r) => r._id !== userId));
      loadFriends();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeclineRequest = async (userId) => {
    try {
      await apiService.declineFriendRequest(userId);
      setFriendRequests(friendRequests.filter((r) => r._id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      await apiService.removeFriend(userId);
      setFriends(friends.filter((f) => f._id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  const bgColor = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textColor = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-100";

  const renderUserCard = (user, type) => (
    <div
      key={user._id || user.id}
      className={`${cardBg} rounded-xl p-4 flex items-center justify-between`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            darkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User size={24} className={textMuted} />
          )}
        </div>
        <div>
          <p className={`font-medium ${textColor}`}>{user.name}</p>
          <p className={`text-sm ${textMuted}`}>{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {type === "search" && (
          <>
            {user.isFriend ? (
              <span className="flex items-center gap-1 text-green-500 text-sm">
                <UserCheck size={16} />
                {t("friends")}
              </span>
            ) : user.isPending ? (
              <span className="flex items-center gap-1 text-yellow-500 text-sm">
                <Clock size={16} />
                {t("requestSent")}
              </span>
            ) : user.hasRequest ? (
              <>
                <button
                  onClick={() => handleAcceptRequest(user.id)}
                  className="p-2 bg-green-500 text-white rounded-lg"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => handleDeclineRequest(user.id)}
                  className="p-2 bg-red-500 text-white rounded-lg"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={() => handleSendRequest(user.id)}
                className="p-2 bg-blue-500 text-white rounded-lg flex items-center gap-1"
              >
                <UserPlus size={16} />
              </button>
            )}
          </>
        )}

        {type === "friend" && (
          <>
            <button
              onClick={() => onViewProfile && onViewProfile(user._id)}
              className="p-2 bg-blue-500 text-white rounded-lg text-sm"
            >
              {t("viewProfile")}
            </button>
            <button
              onClick={() => handleRemoveFriend(user._id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
            >
              <UserX size={18} />
            </button>
          </>
        )}

        {type === "request" && (
          <>
            <button
              onClick={() => handleAcceptRequest(user._id)}
              className="p-2 bg-green-500 text-white rounded-lg"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => handleDeclineRequest(user._id)}
              className="p-2 bg-red-500 text-white rounded-lg"
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={`w-full min-h-screen ${bgColor} p-6`}>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2">
          <ArrowLeft size={24} className={textColor} />
        </button>
        <h1 className={`text-2xl font-bold ${textColor}`}>{t("friends")}</h1>
      </div>

      <div className={`relative mb-6`}>
        <Search
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${textMuted}`}
          size={20}
        />
        <input
          type="text"
          placeholder={t("searchUsers")}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className={`w-full pl-12 pr-4 py-3 ${inputBg} rounded-xl border-none outline-none ${textColor}`}
        />
        {isSearching && (
          <Loader2
            className="absolute right-4 top-1/2 transform -translate-y-1/2 animate-spin"
            size={20}
          />
        )}
      </div>

      {searchQuery.length >= 2 && (
        <div className="space-y-3 mb-6">
          <p className={`text-sm ${textMuted}`}>
            {t("search")}: "{searchQuery}"
          </p>
          {searchResults.length === 0 ? (
            <p className={textMuted}>{t("noNotesFound")}</p>
          ) : (
            searchResults.map((user) => renderUserCard(user, "search"))
          )}
        </div>
      )}

      {searchQuery.length < 2 && (
        <>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 py-2 rounded-xl font-medium transition-colors ${
                activeTab === "friends"
                  ? "bg-gray-800 text-white"
                  : `${cardBg} ${textColor}`
              }`}
            >
              {t("friends")} ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-2 rounded-xl font-medium transition-colors ${
                activeTab === "requests"
                  ? "bg-gray-800 text-white"
                  : `${cardBg} ${textColor}`
              }`}
            >
              {t("friendRequests")} ({friendRequests.length})
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className={`${textMuted} animate-spin`} />
            </div>
          ) : activeTab === "friends" ? (
            <div className="space-y-3">
              {friends.length === 0 ? (
                <p className={`text-center py-12 ${textMuted}`}>
                  {t("noFriends")}
                </p>
              ) : (
                friends.map((friend) => renderUserCard(friend, "friend"))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {friendRequests.length === 0 ? (
                <p className={`text-center py-12 ${textMuted}`}>
                  {t("noFriendRequests")}
                </p>
              ) : (
                friendRequests.map((request) =>
                  renderUserCard(request, "request")
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function FriendProfilePage({ userId, onBack, darkMode }) {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileData, notesData] = await Promise.all([
          apiService.getUserProfile(userId),
          apiService.getUserNotes(userId),
        ]);
        setProfile(profileData);
        setNotes(notesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const handleLike = async (noteId) => {
    try {
      const result = await apiService.likeNote(noteId);
      setNotes(
        notes.map((n) =>
          n._id === noteId
            ? { ...n, isLiked: result.liked, likesCount: result.likesCount }
            : n
        )
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleDuplicate = async (noteId) => {
    try {
      await apiService.duplicateNote(noteId);
      alert(t("duplicated"));
    } catch (err) {
      console.error("Duplicate error:", err);
    }
  };

  const bgColor = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textColor = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";

  if (isLoading) {
    return (
      <div className={`w-full min-h-screen ${bgColor} flex items-center justify-center`}>
        <Loader2 size={32} className={`${textMuted} animate-spin`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full min-h-screen ${bgColor} p-6`}>
        <button onClick={onBack} className="p-2 mb-4">
          <ArrowLeft size={24} className={textColor} />
        </button>
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${bgColor} p-6`}>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2">
          <ArrowLeft size={24} className={textColor} />
        </button>
        <h1 className={`text-2xl font-bold ${textColor}`}>{profile?.name}</h1>
      </div>

      <div className={`${cardBg} rounded-2xl p-6 mb-6`}>
        <div className="flex items-center gap-4">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
              darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              profile?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className={`text-xl font-bold ${textColor}`}>{profile?.name}</p>
            <p className={textMuted}>{profile?.email}</p>
            {profile?.bio && <p className={`mt-2 ${textColor}`}>{profile.bio}</p>}
            <p className={`text-sm ${textMuted} mt-1`}>
              {profile?.friendsCount} {t("friends")}
            </p>
          </div>
        </div>
      </div>

      <h2 className={`text-lg font-bold ${textColor} mb-4`}>
        {t("friendsNotes")}
      </h2>

      {!profile?.canViewNotes ? (
        <div className={`text-center py-12 ${textMuted}`}>
          {t("privateProfile")}
        </div>
      ) : notes.length === 0 ? (
        <div className={`text-center py-12 ${textMuted}`}>{t("noNotesYet")}</div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className="rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: note.color }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {note.title}
              </h3>
              <p className="text-gray-700 mb-3 line-clamp-3">{note.content}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    {note.likesCount} {t("likes")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(note._id)}
                    className={`p-2 rounded-lg ${
                      note.isLiked
                        ? "bg-red-100 text-red-500"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Heart size={18} fill={note.isLiked ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(note._id)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
