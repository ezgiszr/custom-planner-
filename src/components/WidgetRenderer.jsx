import React, { useState, useEffect, useRef } from "react";
import { X, GripHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import TodoWidget from "./widgets/TodoWidget";
import TimerWidget from "./widgets/TimerWidget";
import WeeklyPlanner from "./widgets/WeeklyPlanner";
import CalendarWidget from "./widgets/CalendarWidget";
import { useStore } from "@/context/StoreContext";

import NotesWidget from "./widgets/NotesWidget";

const WIDGET_TITLES = {
  todo: "Görev Listesi",
  timer: "Zamanlayıcı",
  weekly: "Haftalık Plan",
  calendar: "Takvim",
  notes: "Not Defteri",
};

export default function WidgetRenderer({ id, type, onRemove }) {
  const { noteTitle, setNoteTitle } = useStore();
  const [localTitle, setLocalTitle] = useState(noteTitle || "Not Defteri");
  const saveTitleTimerRef = useRef(null);

  useEffect(() => {
    if (type === "notes") {
      setLocalTitle(noteTitle || "Not Defteri");
    }
  }, [noteTitle, type]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setLocalTitle(val);
    if (saveTitleTimerRef.current) clearTimeout(saveTitleTimerRef.current);
    saveTitleTimerRef.current = setTimeout(() => {
      setNoteTitle(val);
    }, 500);
  };

  const getTitleElement = () => {
    if (type === "notes") {
      return (
        <input 
          type="text"
          value={localTitle}
          onChange={handleTitleChange}
          placeholder="Not Defteri"
          className="text-sm font-semibold text-rose-700 bg-transparent border-none outline-none focus:ring-1 focus:ring-rose-300 rounded px-1 -ml-1 w-[150px]"
        />
      );
    }
    return <span className="text-sm font-semibold text-rose-700">{WIDGET_TITLES[type]}</span>;
  };

  const renderWidgetContent = () => {
    switch (type) {
      case "todo":
        return <TodoWidget />;
      case "timer":
        return <TimerWidget />;
      case "weekly":
        return <WeeklyPlanner />;
      case "calendar":
        return <CalendarWidget />;
      case "notes":
        return <NotesWidget />;
      default:
        return <div className="p-4">Bilinmeyen Widget: {type}</div>;
    }
  };

  return (
    <Card className="h-full w-full flex flex-col overflow-hidden bg-white/45 backdrop-blur-2xl border-white/70 shadow-[0_10px_30px_rgba(244,170,200,0.2)]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/50 bg-white/30 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="drag-handle cursor-move text-rose-400 hover:text-rose-600 p-1">
            <GripHorizontal className="h-4 w-4" />
          </div>
          {getTitleElement()}
        </div>
        <button
          onClick={() => onRemove(id)}
          className="text-rose-400 hover:text-rose-600 p-1 hover:bg-white/40 rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-hidden scalable-widget">
        {renderWidgetContent()}
      </div>
    </Card>
  );
}
