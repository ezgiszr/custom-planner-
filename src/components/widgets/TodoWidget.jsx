import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, Clock3, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/context/StoreContext";

export default function TodoWidget() {
  const { tasks, setTasks, activeTaskId, setIsRunning, setActiveTaskId } = useStore();
  const [task, setTask] = useState("");
  const [minutes, setMinutes] = useState("");
  const [category, setCategory] = useState("Medium");
  const [editingTask, setEditingTask] = useState(null);

  const addTask = () => {
    const trimmed = task.trim();
    const parsedMinutes = Number(minutes);
    if (!trimmed || !parsedMinutes || parsedMinutes <= 0) return;
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: trimmed,
        done: false,
        duration: parsedMinutes,
        remaining: parsedMinutes * 60,
        category,
      },
    ]);
    setTask("");
    setMinutes("");
    setCategory("Medium");
  };

  const saveEdit = () => {
    if (!editingTask || !editingTask.text.trim() || editingTask.duration <= 0) return;
    setTasks((prev) =>
      prev.map((item) =>
        item.id === editingTask.id
          ? {
              ...item,
              text: editingTask.text.trim(),
              duration: editingTask.duration,
              remaining: item.duration === editingTask.duration ? item.remaining : editingTask.duration * 60,
              category: editingTask.category,
            }
          : item
      )
    );
    setEditingTask(null);
  };

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const deleteTask = (id) => {
    if (activeTaskId === id) {
      setActiveTaskId(null);
      setIsRunning(false);
    }
    setTasks((prev) => prev.filter((item) => item.id !== id));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const renderTaskList = (catFilter) => {
    const catTasks = tasks.filter(t => t.category === catFilter);
    if (catTasks.length === 0) return null;

    return (
      <div key={catFilter} className="space-y-3 pt-2">
        <h3 className="font-semibold text-rose-800 flex items-center gap-2">
          {catFilter === "Easy" ? "🌱 Kolay" : catFilter === "Medium" ? "⭐ Orta" : "🔥 Zor"}
        </h3>
        {catTasks.map((item, index) => {
          const isActive = activeTaskId === item.id;
          const isEditing = editingTask?.id === item.id;
          
          return (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className={`rounded-xl border p-3 shadow-sm ${
                isActive ? "border-rose-300 bg-rose-50" : "border-white/70 bg-white/50"
              }`}
            >
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <Input
                    value={editingTask.text}
                    onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                    className="h-8 text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editingTask.duration}
                      onChange={(e) => setEditingTask({ ...editingTask, duration: Number(e.target.value) || 0 })}
                      className="h-8 w-16 text-sm"
                    />
                    <select
                      value={editingTask.category}
                      onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="Easy">Kolay</option>
                      <option value="Medium">Orta</option>
                      <option value="Hard">Zor</option>
                    </select>
                    <div className="ml-auto flex gap-1">
                      <Button onClick={saveEdit} size="icon" className="h-8 w-8 bg-green-500 hover:bg-green-600">
                        <Check className="h-4 w-4 text-white" />
                      </Button>
                      <Button onClick={() => setEditingTask(null)} size="icon" variant="ghost" className="h-8 w-8 text-rose-500">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleTask(item.id)} className="text-rose-500 hover:scale-105 transition-transform shrink-0">
                    {item.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${item.done ? "text-rose-300 line-through" : "text-rose-700"}`}>
                      {item.text}
                    </p>
                    <div className="text-xs text-rose-500 flex gap-2 mt-1">
                      <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {item.duration}dk</span>
                      <span>Kalan: {formatTime(item.remaining)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setEditingTask({ ...item })} className="h-7 w-7 text-rose-400">
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTask(item.id)} className="h-7 w-7 text-rose-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden p-4">
      <div className="flex-none space-y-2">
        <label className="text-sm font-semibold text-rose-700">Yeni Görev Ekle</label>
        <div className="space-y-2">
          <Input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Yapmak istediğin işi yaz"
            className="border-rose-200 bg-white/70"
          />
          <div className="flex gap-2">
            <Input
              value={minutes}
              onChange={(e) => setMinutes(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Süre (dk)"
              className="w-20 border-rose-200 bg-white/70"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-rose-200 bg-white/70 px-2 text-sm text-rose-700 outline-none focus:ring-2 focus:ring-rose-300 flex-1"
            >
              <option value="Easy">Kolay</option>
              <option value="Medium">Orta</option>
              <option value="Hard">Zor</option>
            </select>
            <Button onClick={addTask} className="bg-rose-400 hover:bg-rose-500 shrink-0 px-3">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center text-sm text-rose-400 py-6 border border-dashed border-rose-200 rounded-xl bg-rose-50/50">Henüz görev yok</div>
        ) : (
          <>
            {renderTaskList("Easy")}
            {renderTaskList("Medium")}
            {renderTaskList("Hard")}
          </>
        )}
      </div>
    </div>
  );
}
