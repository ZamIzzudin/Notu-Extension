/** @format */

export const translations = {
  id: {
    // Login Page
    login: "Masuk",
    register: "Daftar",
    name: "Nama",
    email: "Email",
    password: "Password",
    loggingIn: "Masuk...",
    registering: "Mendaftar...",
    tagline: "Catat dari mana saja",

    // Notes Page
    search: "Cari...",
    newNote: "Catatan Baru",
    noNotesYet: "Belum ada catatan",
    noNotesYetDesc: "Ketuk tombol + untuk membuat catatan pertama",
    noNotesFound: "Catatan tidak ditemukan",

    // Note Editor
    title: "Judul",
    noteContent: "Isi catatan...",
    addImages: "Tambah Gambar",
    untitled: "Tanpa Judul",

    // Delete Modal
    deleteNote: "Hapus Catatan",
    deleteConfirmation:
      "Apakah kamu yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan.",
    cancel: "Batal",
    delete: "Hapus",

    // User Menu
    signOut: "Keluar",

    // Status
    loading: "Memuat...",
    syncFailed: "Gagal sinkronisasi",
    saveFailed: "Gagal menyimpan",
    deleteFailed: "Gagal menghapus",

    // Time
    justNow: "Baru saja",
    minutesAgo: "{n} menit lalu",
    hoursAgo: "{n} jam lalu",
    daysAgo: "{n} hari lalu",

    // Language
    language: "Bahasa",
  },
  en: {
    // Login Page
    login: "Sign In",
    register: "Sign Up",
    name: "Name",
    email: "Email",
    password: "Password",
    loggingIn: "Signing in...",
    registering: "Signing up...",
    tagline: "Notes from anywhere",

    // Notes Page
    search: "Search...",
    newNote: "New Note",
    noNotesYet: "No notes yet",
    noNotesYetDesc: "Tap the + button to create your first note",
    noNotesFound: "No notes found",

    // Note Editor
    title: "Title",
    noteContent: "Note content...",
    addImages: "Add Images",
    untitled: "Untitled",

    // Delete Modal
    deleteNote: "Delete Note",
    deleteConfirmation:
      "Are you sure you want to delete this note? This action cannot be undone.",
    cancel: "Cancel",
    delete: "Delete",

    // User Menu
    signOut: "Sign Out",

    // Status
    loading: "Loading...",
    syncFailed: "Failed to sync",
    saveFailed: "Failed to save",
    deleteFailed: "Failed to delete",

    // Time
    justNow: "Just now",
    minutesAgo: "{n} min ago",
    hoursAgo: "{n} hour{s} ago",
    daysAgo: "{n} day{s} ago",

    // Language
    language: "Language",
  },
};

export const getTranslation = (lang, key, params = {}) => {
  const text = translations[lang]?.[key] || translations.id[key] || key;

  return text.replace(/\{(\w+)\}/g, (_, param) => {
    if (param === "s") {
      return params.n > 1 ? "s" : "";
    }
    return params[param] ?? "";
  });
};
