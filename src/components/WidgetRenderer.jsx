import React from "react";
import { X, GripHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import TodoWidget from "./widgets/TodoWidget";
import TimerWidget from "./widgets/TimerWidget";
import WeeklyPlanner from "./widgets/WeeklyPlanner";
import CalendarWidget from "./widgets/CalendarWidget";

const WIDGET_TITLES = {
  todo: "Görev Listesi",
  timer: "Zamanlayıcı",
  weekly: "Haftalık Plan",
  calendar: "Takvim",
};

export default function WidgetRenderer({ id, type, onRemove }) {
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
          <span className="text-sm font-semibold text-rose-700">{WIDGET_TITLES[type]}</span>
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
