import React from "react";
import { Play, Pause, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/StoreContext";

export default function TimerWidget() {
  const { tasks, setTasks, activeTaskId, setActiveTaskId, isRunning, setIsRunning } = useStore();

  const activeTask = tasks.find(t => t.id === activeTaskId);

  const startTask = (id) => {
    setActiveTaskId(id);
    setIsRunning(true);
  };

  const pauseTask = () => {
    if (isRunning) setIsRunning(false);
  };

  const resetTask = () => {
    setIsRunning(false);
    setTasks(prev =>
      prev.map(item =>
        item.id === activeTaskId
          ? { ...item, remaining: item.duration * 60, done: false }
          : item
      )
    );
  };

  const stopTask = () => {
    setIsRunning(false);
    setActiveTaskId(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      {!activeTask ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-rose-400 font-medium">Aktif görev seçilmedi</p>
          <div className="flex flex-wrap justify-center gap-2 max-h-32 overflow-y-auto">
            {tasks.filter(t => !t.done).map(t => (
              <Button key={t.id} variant="outline" size="sm" onClick={() => startTask(t.id)} className="border-rose-200 text-rose-600 hover:bg-rose-50">
                <Play className="h-3 w-3 mr-1" />
                {t.text}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 w-full max-w-xs">
          <div>
            <p className="text-sm font-semibold text-rose-500 mb-1">Odaklanılıyor</p>
            <h3 className="text-xl font-bold text-rose-800 line-clamp-2">{activeTask.text}</h3>
          </div>

          <div className="relative w-40 h-40 mx-auto flex items-center justify-center rounded-full border-4 border-rose-100 shadow-inner bg-white/50">
            <span className="text-4xl font-black text-rose-600 tabular-nums tracking-tighter">
              {formatTime(activeTask.remaining)}
            </span>
          </div>

          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <Button onClick={() => startTask(activeTask.id)} className="rounded-full px-5 bg-rose-500 hover:bg-rose-600">
                <Play className="mr-2 h-4 w-4" /> Devam Et
              </Button>
            ) : (
              <Button onClick={pauseTask} variant="outline" className="rounded-full px-5 border-rose-200 text-rose-700 hover:bg-rose-50">
                <Pause className="mr-2 h-4 w-4" /> Duraklat
              </Button>
            )}
            <Button onClick={resetTask} variant="outline" className="rounded-full px-3 border-rose-200 text-rose-500 hover:bg-rose-50" title="Sıfırla">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button onClick={stopTask} variant="outline" className="rounded-full px-3 border-rose-200 text-rose-400 hover:bg-rose-50" title="Durdur">
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
