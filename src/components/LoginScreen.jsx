import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Flower2, LogIn } from "lucide-react";

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8"
      style={{ background: "linear-gradient(135deg, #FFE4FB 0%, #C5E3FF 100%)" }}
    >
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute left-8 top-10 text-pink-300"><Flower2 className="h-20 w-20" /></div>
        <div className="absolute right-12 top-24 text-blue-200"><Flower2 className="h-14 w-14" /></div>
        <div className="absolute bottom-16 left-16 text-pink-200"><Flower2 className="h-24 w-24" /></div>
        <div className="absolute bottom-24 right-20 text-blue-100"><Flower2 className="h-16 w-16" /></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 bg-white/60 backdrop-blur-2xl border border-white/70 shadow-2xl rounded-3xl px-12 py-10 max-w-sm w-full text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-gradient-to-br from-rose-300 to-pink-400 rounded-2xl p-4 shadow-lg">
            <Flower2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-rose-800 mt-2">Soft Bloom</h1>
          <p className="text-sm text-rose-400">Kişisel planlamana hoş geldin 🌸</p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-3 w-full justify-center bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl px-5 py-3 shadow transition-all hover:shadow-md active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.7 35.6 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C37.1 38.8 44 33.5 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          Google ile giriş yap
        </button>

        <p className="text-xs text-rose-300">Veriler güvenli şekilde hesabına bağlı saklanır.</p>
      </div>
    </div>
  );
}
