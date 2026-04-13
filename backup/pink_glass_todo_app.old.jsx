import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, Play, Pause, Flower2, Clock3, Edit2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PinkGlassTodoApp() {
  const [task, setTask] = useState("");
  const [minutes, setMinutes] = useState("");
  const [category, setCategory] = useState("Medium"); // Easy, Medium, Hard
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [tasks, setTasks] = useState([
    { id: 1, text: "Sabah planını düzenle", done: true, duration: 20, remaining: 0, category: "Easy" },
    { id: 2, text: "Ders notlarını gözden geçir", done: false, duration: 45, remaining: 45 * 60, category: "Medium" },
    { id: 3, text: "Yeni görev ekleme alanını test et", done: false, duration: 30, remaining: 30 * 60, category: "Hard" },
  ]);

  useEffect(() => {
    if (!isRunning || activeTaskId === null) return;
    const timer = setInterval(() => {
      setTasks((prev) =>
        prev.map((item) => {
          if (item.id !== activeTaskId) return item;
          if (item.remaining <= 1) {
            setIsRunning(false);
            return { ...item, remaining: 0, done: true };
          }
          return { ...item, remaining: item.remaining - 1 };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, activeTaskId]);

  const completedCount = useMemo(() => tasks.filter((item) => item.done).length, [tasks]);
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

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

  const startTask = (id) => {
    setActiveTaskId(id);
    setIsRunning(true);
  };

  const pauseTask = (id) => {
    if (activeTaskId === id) setIsRunning(false);
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
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className={`rounded-3xl border p-4 shadow-md backdrop-blur-xl ${
                isActive ? "border-rose-300 bg-rose-50/70" : "border-white/70 bg-white/35"
              }`}
            >
              {isEditing ? (
                <div className="flex flex-col gap-3">
                  <Input
                    value={editingTask.text}
                    onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                    className="h-10 rounded-xl border-white/70 bg-white/70 text-rose-900 focus-visible:ring-rose-300"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editingTask.duration}
                      onChange={(e) => setEditingTask({ ...editingTask, duration: Number(e.target.value) || 0 })}
                      className="h-10 w-24 rounded-xl border-white/70 bg-white/70 text-rose-900 focus-visible:ring-rose-300"
                    />
                    <select
                      value={editingTask.category}
                      onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                      className="h-10 rounded-xl border border-white/70 bg-white/70 px-3 text-sm text-rose-900 outline-none focus:ring-2 focus:ring-rose-300"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                    <div className="ml-auto flex gap-2">
                      <Button
                        onClick={saveEdit}
                        className="h-10 rounded-xl bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setEditingTask(null)}
                        variant="ghost"
                        className="h-10 rounded-xl text-rose-500 hover:bg-rose-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTask(item.id)}
                      className="shrink-0 text-rose-500 transition hover:scale-105"
                      aria-label="Toggle Task"
                    >
                      {item.done ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={`text-base font-medium ${item.done ? "text-rose-300 line-through" : "text-rose-700"}`}>
                        {item.text}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-rose-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-4 w-4" />
                          Süre: {item.duration} dk
                        </span>
                        <span>Kalan: {formatTime(item.remaining)}</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        onClick={() => setEditingTask({ ...item })}
                        className="h-8 w-8 rounded-full p-0 text-rose-400 hover:bg-white/40 hover:text-rose-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => deleteTask(item.id)}
                        className="h-8 w-8 rounded-full p-0 text-rose-500 hover:bg-white/40 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => startTask(item.id)} className="rounded-2xl bg-rose-100 text-rose-700 hover:bg-rose-200">
                      <Play className="mr-2 h-4 w-4" /> Başlat
                    </Button>
                    {isActive && isRunning && (
                      <Button onClick={() => pauseTask(item.id)} className="rounded-2xl bg-white text-rose-700 hover:bg-rose-50">
                        <Pause className="mr-2 h-4 w-4" /> Duraklat
                      </Button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff7fb_0%,#ffeaf4_35%,#ffe2ef_70%,#fff4f8_100%)] p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-8 top-10 text-pink-200"><Flower2 className="h-16 w-16" /></div>
        <div className="absolute right-12 top-24 text-rose-200"><Flower2 className="h-12 w-12" /></div>
        <div className="absolute bottom-16 left-16 text-pink-100"><Flower2 className="h-20 w-20" /></div>
        <div className="absolute bottom-20 right-20 text-rose-100"><Flower2 className="h-14 w-14" /></div>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/45 shadow-[0_20px_60px_rgba(244,170,200,0.25)] backdrop-blur-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-rose-500/80">
                    <Flower2 className="h-4 w-4" /> Soft Bloom Planner
                  </p>
                  <CardTitle className="text-3xl font-bold tracking-tight text-rose-700 md:text-4xl">
                    Görevlerini nazikçe yönet
                  </CardTitle>
                </div>
                <div className="rounded-full border border-white/70 bg-white/55 px-4 py-2 text-sm font-semibold text-rose-600 shadow-lg backdrop-blur-xl">
                  %{progress}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-3xl border border-white/70 bg-white/40 p-4 shadow-inner backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between text-sm font-medium text-rose-700">
                  <span>İlerleme</span>
                  <span>{completedCount}/{tasks.length} tamamlandı</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-rose-100/80">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#f9b4d0_0%,#f7a8c4_50%,#f4c2d7_100%)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/40 p-4 backdrop-blur-xl">
                <label className="mb-3 block text-sm font-medium text-rose-700">
                  Yeni görev ekle
                </label>
                <div className="space-y-3">
                  <Input
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Yapmak istediğin işi yaz"
                    className="h-12 rounded-2xl border-white/70 bg-white/70 text-base text-rose-900 placeholder:text-rose-400"
                  />
                  <div className="grid gap-3 md:grid-cols-[110px_1fr_auto]">
                    <Input
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="Süre (dk)"
                      className="h-12 rounded-2xl border-white/70 bg-white/70 text-base text-rose-900 placeholder:text-rose-400"
                    />
                    
                    <div className="flex items-center gap-1 rounded-2xl border border-white/70 bg-white/70 p-1">
                      {["Easy", "Medium", "Hard"].map(c => (
                        <button
                          key={c}
                          onClick={() => setCategory(c)}
                          className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                            category === c 
                              ? "bg-rose-400 text-white shadow" 
                              : "text-rose-600 hover:bg-rose-50"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={addTask}
                      className="h-12 rounded-2xl border border-white/70 bg-white/75 px-5 text-rose-700 shadow-lg hover:bg-white"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Ekle
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-3xl border border-white/70 bg-white/40 p-4 text-rose-700 backdrop-blur-xl">
                  <p className="text-sm text-rose-500">Toplam</p>
                  <p className="mt-2 text-2xl font-bold">{tasks.length}</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/40 p-4 text-rose-700 backdrop-blur-xl">
                  <p className="text-sm text-rose-500">Biten</p>
                  <p className="mt-2 text-2xl font-bold">{completedCount}</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/40 p-4 text-rose-700 backdrop-blur-xl min-w-0">
                  <p className="text-sm text-rose-500">Aktif</p>
                  <p className="mt-2 text-lg font-bold truncate">
                    {activeTaskId ? tasks.find((t) => t.id === activeTaskId)?.text || "-" : "Yok"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
          <Card className="h-full rounded-[2rem] border border-white/70 bg-white/45 shadow-[0_20px_60px_rgba(244,170,200,0.25)] backdrop-blur-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-rose-700">Görev Listesi</CardTitle>
              <p className="text-sm text-rose-500">Her görev için süre belirle, sonra başlat tuşuna basıp odaklan.</p>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/70 bg-white/30 p-8 text-center text-rose-500 backdrop-blur-xl">
                  Henüz görev eklenmedi.
                </div>
              ) : (
                <div className="space-y-6">
                  {renderTaskList("Easy")}
                  {renderTaskList("Medium")}
                  {renderTaskList("Hard")}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
