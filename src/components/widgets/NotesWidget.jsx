import React, { useState, useEffect, useRef } from "react";
import { useStore } from "@/context/StoreContext";

export default function NotesWidget() {
  const { noteText, setNoteText } = useStore();
  const [localText, setLocalText] = useState(noteText || "");
  const saveTimerRef = useRef(null);

  // Sync with global store when it changes externally (e.g. initial load)
  useEffect(() => {
    setLocalText(noteText || "");
  }, [noteText]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalText(val); // Update UI immediately

    // Debounce the store update to avoid too many writes
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setNoteText(val);
    }, 500);
  };

  return (
    <div className="h-full flex flex-col p-4 pt-1">
      <textarea
        className="flex-1 w-full resize-none rounded-xl border border-rose-200 bg-white/60 p-3 text-sm text-rose-800 outline-none focus:bg-white/90 focus:border-rose-400 focus:shadow-md transition-all placeholder:text-rose-300/70"
        placeholder="Aklınıza gelenleri buraya yazın..."
        value={localText}
        onChange={handleChange}
        spellCheck="false"
      />
    </div>
  );
}
