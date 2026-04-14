import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Clock, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WeeklyPlanner() {
  const { weeklyEvents, setWeeklyEvents } = useStore();
  const [newEventText, setNewEventText] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [selectedDay, setSelectedDay] = useState("Pzt");

  const [editingEventId, setEditingEventId] = useState(null);
  const editorRef = useRef(null);

  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (editingEventId) {
        if (editorRef.current && editorRef.current.contains(e.target)) return;
        if (e.target.closest('[data-event-item="true"]')) return;
        cancelEdit();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingEventId]);

  const startEditing = (e) => {
    setEditingEventId(e.id);
    setNewEventText(e.text || "");
    setNewEventStartTime(e.startTime || e.time || "");
    setNewEventEndTime(e.endTime || "");
    setSelectedDay(e.day);
  };

  const saveEvent = () => {
    const trimmedText = newEventText.trim();
    if (!trimmedText) return;

    if (editingEventId) {
      setWeeklyEvents((prev) => 
        prev.map(ev => 
          ev.id === editingEventId 
            ? { ...ev, text: trimmedText, startTime: newEventStartTime, endTime: newEventEndTime, day: selectedDay, time: undefined } 
            : ev
        )
      );
      setEditingEventId(null);
    } else {
      setWeeklyEvents((prev) => [
        ...prev,
        { 
          id: Date.now(), 
          day: selectedDay, 
          startTime: newEventStartTime, 
          endTime: newEventEndTime, 
          text: trimmedText 
        },
      ]);
    }
    setNewEventText("");
    setNewEventStartTime("");
    setNewEventEndTime("");
  };

  const cancelEdit = () => {
    setEditingEventId(null);
    setNewEventText("");
    setNewEventStartTime("");
    setNewEventEndTime("");
  };

  const removeEvent = (id) => {
    setWeeklyEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-semibold text-rose-800">Haftalık Plan</h3>
        <div ref={editorRef} className="flex gap-2 items-center flex-wrap sm:flex-nowrap justify-end">
          <Input 
            value={newEventText}
            onChange={(e) => setNewEventText(e.target.value)}
            placeholder="Örn: Okul Programı"
            className="h-8 text-xs bg-white/70 border-rose-200 min-w-[120px]"
            onKeyDown={(e) => e.key === "Enter" && saveEvent()}
          />
          <Input 
            type="time"
            value={newEventStartTime}
            onChange={(e) => setNewEventStartTime(e.target.value)}
            className="h-8 text-xs bg-white/70 border-rose-200 w-[95px]"
            title="Başlangıç saati"
          />
          <span className="text-rose-300 text-xs font-semibold select-none">–</span>
          <Input 
            type="time"
            value={newEventEndTime}
            onChange={(e) => setNewEventEndTime(e.target.value)}
            className="h-8 text-xs bg-white/70 border-rose-200 w-[95px]"
            title="Bitiş saati"
          />
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="h-8 rounded-md border border-rose-200 bg-white/70 px-2 text-xs text-rose-700 outline-none"
          >
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <Button onClick={saveEvent} size="icon" className={`h-8 w-8 shrink-0 ${editingEventId ? 'bg-green-500 hover:bg-green-600' : 'bg-rose-400 hover:bg-rose-500'}`}>
            {editingEventId ? <Check className="h-4 w-4 text-white" /> : <Plus className="h-4 w-4 text-white" />}
          </Button>
          {editingEventId && (
            <Button onClick={cancelEdit} size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-rose-400 hover:text-rose-500 hover:bg-rose-100">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[600px] h-full">
          {days.map((day) => {
            const dayEvents = weeklyEvents.filter((e) => e.day === day);
              
            return (
              <div key={day} className="flex flex-col items-center h-full">
                <div className="text-xs font-medium text-rose-500 mb-2">{day}</div>
                <div 
                  className="w-full h-full bg-white/50 border border-rose-100 rounded-lg min-h-[150px] p-1.5 flex flex-col gap-2 shadow-sm transition-colors duration-200"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData("eventId");
                    if (!draggedId) return;
                    
                    setWeeklyEvents(prev => {
                      const draggedIdx = prev.findIndex(ev => String(ev.id) === String(draggedId));
                      if (draggedIdx === -1) return prev;
                      
                      const newEvents = [...prev];
                      const [draggedEvent] = newEvents.splice(draggedIdx, 1);
                      draggedEvent.day = day; // Ensure day is updated if dropped into a different column
                      
                      // Pushing to the end of the array moves it to the bottom of that day's column
                      newEvents.push(draggedEvent);
                      return newEvents;
                    });
                  }}
                >
                  {dayEvents.map((e) => (
                    <div
                      key={e.id}
                      draggable
                      onDragStart={(evt) => {
                        evt.dataTransfer.setData("eventId", e.id);
                        evt.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(evt) => {
                        evt.preventDefault();
                        evt.stopPropagation();
                      }}
                      onDrop={(evt) => {
                        evt.preventDefault();
                        evt.stopPropagation();
                        const draggedId = evt.dataTransfer.getData("eventId");
                        if (!draggedId || String(draggedId) === String(e.id)) return;
                        
                        setWeeklyEvents(prev => {
                          const originalDraggedIdx = prev.findIndex(ev => String(ev.id) === String(draggedId));
                          const originalTargetIdx = prev.findIndex(ev => String(ev.id) === String(e.id));
                          
                          if (originalDraggedIdx === -1 || originalTargetIdx === -1) return prev;
                          
                          const newEvents = [...prev];
                          const [draggedEvent] = newEvents.splice(originalDraggedIdx, 1);
                          draggedEvent.day = day;
                          
                          newEvents.splice(originalTargetIdx, 0, draggedEvent);
                          return newEvents;
                        });
                      }}
                      data-event-item="true"
                      className={`group relative flex flex-col text-[11px] leading-tight bg-rose-100 text-rose-800 rounded p-1.5 border border-rose-200 break-words cursor-grab active:cursor-grabbing hover:border-rose-400 hover:shadow-md transition-all select-none ${editingEventId === e.id ? 'border-rose-400 shadow-sm opacity-50' : ''}`}
                      onClick={() => startEditing(e)}
                    >
                      {(e.startTime || e.endTime || e.time) && (
                        <div className="flex items-center text-[10px] text-rose-500 font-semibold mb-0.5 pointer-events-none">
                          <Clock className="w-3 h-3 mr-1" />
                          {e.startTime && e.endTime
                            ? `${e.startTime} – ${e.endTime}`
                            : e.startTime || e.endTime || e.time}
                        </div>
                      )}
                      <span className="pr-3 pointer-events-none">{e.text}</span>
                      
                      <button 
                        type="button"
                        onClick={(evt) => { evt.stopPropagation(); removeEvent(e.id); }}
                        className="absolute right-1 top-1 text-rose-400 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        aria-label="Remove Event"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
