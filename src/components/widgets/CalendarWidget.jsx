import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X, Plus, ArrowLeft, Clock } from "lucide-react";
import { useStore } from "@/context/StoreContext";

const DAYS_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];
const WEEKDAY_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

const EVENT_EMOJIS = ["💗", "☕", "⭐", "🌸", "📌", "🎀", "💜", "🌿", "🎵", "📚", "🏃", "🍰"];

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarWidget() {
  const { calendarEvents, setCalendarEvents } = useStore();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // "calendar" | "day"
  const [view, setView] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(null);

  const [inputText, setInputText] = useState("");
  const [inputTime, setInputTime] = useState("");
  const [inputEmoji, setInputEmoji] = useState("💗");

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const openDay = (dateKey) => {
    setSelectedDate(dateKey);
    setInputText("");
    setInputTime("");
    setInputEmoji("💗");
    setView("day");
  };

  const backToCalendar = () => {
    setView("calendar");
    setSelectedDate(null);
  };

  // Build grid
  const firstDay = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: prevMonthLastDay - startOffset + 1 + i, type: "prev" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: "current" });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - startOffset - daysInMonth + 1, type: "next" });
  }
  const numRows = cells.length / 7;

  const eventsForDate = (dateKey) =>
    calendarEvents
      .filter(e => e.date === dateKey)
      .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));

  const addEvent = () => {
    if (!inputText.trim() || !selectedDate) return;
    setCalendarEvents(prev => [...prev, {
      id: Date.now(),
      date: selectedDate,
      text: inputText.trim(),
      time: inputTime,
      emoji: inputEmoji,
    }]);
    setInputText("");
    setInputTime("");
    setInputEmoji("💗");
  };

  const removeEvent = (id) => {
    setCalendarEvents(prev => prev.filter(e => String(e.id) !== String(id)));
  };

  // ────── DAY VIEW ──────
  if (view === "day") {
    const [y, m, d] = selectedDate.split("-");
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const weekday = WEEKDAY_TR[dateObj.getDay()];
    const dayEvents = eventsForDate(selectedDate);

    return (
      <div
        className="h-full flex flex-col"
        style={{ fontFamily: "'Quicksand', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2 flex-shrink-0">
          <button
            onClick={backToCalendar}
            className="p-1.5 rounded-xl bg-white/60 hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <p className="text-[10px] text-rose-300 font-semibold uppercase tracking-wider">{weekday}</p>
            <h3 className="text-sm font-bold text-rose-700 leading-tight">
              {parseInt(d)} {MONTHS_TR[parseInt(m) - 1]} {y}
            </h3>
          </div>
          <span className="text-lg">{dayEvents.length > 0 ? dayEvents[dayEvents.length - 1].emoji || "💗" : "🌸"}</span>
        </div>

        {/* Events list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 space-y-1.5 pb-2">
          {dayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-rose-300 gap-2">
              <span className="text-2xl">🌸</span>
              <p className="text-xs">Henüz etkinlik yok</p>
            </div>
          ) : (
            dayEvents.map(ev => (
              <div
                key={ev.id}
                className="group flex items-center gap-2 bg-white/60 border border-rose-100 rounded-2xl px-3 py-2 shadow-sm"
              >
                <span className="text-sm flex-shrink-0">{ev.emoji || "💗"}</span>
                {ev.time && (
                  <div className="flex items-center gap-1 text-[10px] text-rose-400 font-bold flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    {ev.time}
                  </div>
                )}
                <span className="flex-1 text-xs text-rose-700 font-medium truncate">{ev.text}</span>
                <button
                  onClick={() => removeEvent(ev.id)}
                  className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500 transition-all flex-shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add event form */}
        <div className="flex-shrink-0 px-3 pb-3 pt-1 border-t border-rose-100/60 space-y-2">
          {/* Emoji picker */}
          <div className="flex gap-1 flex-wrap">
            {EVENT_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => setInputEmoji(emoji)}
                className={`text-base rounded-xl p-1 transition-all ${
                  inputEmoji === emoji
                    ? "bg-rose-200 ring-2 ring-rose-400 scale-110"
                    : "bg-white/50 hover:bg-rose-100"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addEvent()}
            placeholder="Etkinlik adı..."
            className="w-full text-xs rounded-xl bg-white/70 border border-rose-200 px-3 py-2 outline-none focus:ring-1 focus:ring-rose-300 text-rose-700 placeholder:text-rose-300"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1 bg-white/70 border border-rose-200 rounded-xl px-3 py-2">
              <Clock className="h-3 w-3 text-rose-300 flex-shrink-0" />
              <input
                type="time"
                value={inputTime}
                onChange={e => setInputTime(e.target.value)}
                className="flex-1 text-xs bg-transparent outline-none text-rose-600"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              />
            </div>
            <button
              onClick={addEvent}
              className="p-2 rounded-xl bg-rose-400 hover:bg-rose-500 text-white transition-colors flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ────── CALENDAR VIEW ──────
  return (
    <div
      className="h-full flex flex-col p-3 gap-1.5"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* Month nav */}
      <div className="flex items-center justify-between flex-shrink-0">
        <button onClick={prevMonth} className="p-1.5 rounded-xl bg-white/60 hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-all">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="font-bold text-rose-700 text-sm tracking-wide">
          {MONTHS_TR[viewMonth]} {viewYear}
        </h3>
        <button onClick={nextMonth} className="p-1.5 rounded-xl bg-white/60 hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-all">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 flex-shrink-0">
        {DAYS_TR.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-rose-300 py-0.5">{d}</div>
        ))}
      </div>

      {/* Grid — fills remaining space, numRows rows */}
      <div
        className="flex-1 min-h-0 grid grid-cols-7"
        style={{ gridTemplateRows: `repeat(${numRows}, 1fr)`, gap: "3px" }}
      >
        {cells.map((cell, i) => {
          const isCurrentMonth = cell.type === "current";
          const dateKey = isCurrentMonth ? toDateKey(viewYear, viewMonth, cell.day) : null;
          const isToday =
            isCurrentMonth &&
            cell.day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();
          const hasEvents = dateKey && eventsForDate(dateKey).length > 0;

          return (
            <button
              key={i}
              onClick={() => isCurrentMonth && openDay(dateKey)}
              disabled={!isCurrentMonth}
              className={[
                "flex flex-col items-center justify-center rounded-2xl text-xs font-semibold transition-all select-none w-full h-full",
                !isCurrentMonth ? "text-rose-200 cursor-default" : "cursor-pointer hover:bg-rose-100 active:scale-95",
                isToday
                  ? "bg-gradient-to-br from-rose-400 to-pink-400 text-white shadow-md shadow-rose-200"
                  : isCurrentMonth
                  ? "text-rose-600 bg-white/40"
                  : "",
              ].join(" ")}
            >
              <span className="leading-none">{cell.day}</span>
              {hasEvents && (() => {
                const dayEvs = eventsForDate(dateKey);
                return (
                  <div className="flex items-center gap-px leading-none mt-0.5">
                    <span style={{ fontSize: "9px" }}>{dayEvs[0]?.emoji || "💗"}</span>
                    {dayEvs.length > 1 && (
                      <span
                        style={{
                          fontSize: "9px",
                          lineHeight: 1,
                          fontFamily: "'Quicksand', sans-serif",
                          fontWeight: 700,
                        }}
                        className="text-rose-400 bg-rose-100 rounded-full px-1 py-px"
                      >
                        +{dayEvs.length - 1}
                      </span>
                    )}
                  </div>
                );
              })()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
