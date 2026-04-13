import React, { createContext, useContext, useState, useMemo, useEffect } from "react";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Sabah planını düzenle", done: true, duration: 20, remaining: 0, category: "Easy" },
    { id: 2, text: "Ders notlarını gözden geçir", done: false, duration: 45, remaining: 45 * 60, category: "Medium" },
    { id: 3, text: "Yeni görev ekleme alanını test et", done: false, duration: 30, remaining: 30 * 60, category: "Hard" },
  ]);

  const [weeklyEvents, setWeeklyEvents] = useState([
    { id: 1, day: "Pzt", time: "10:00", text: "Okul" }
  ]);

  const [activeTaskId, setActiveTaskId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

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

  const value = useMemo(
    () => ({
      tasks,
      setTasks,
      weeklyEvents,
      setWeeklyEvents,
      activeTaskId,
      setActiveTaskId,
      isRunning,
      setIsRunning,
      completedCount: tasks.filter((item) => item.done).length,
      progress: tasks.length === 0 ? 0 : Math.round((tasks.filter((item) => item.done).length / tasks.length) * 100)
    }),
    [tasks, weeklyEvents, activeTaskId, isRunning]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
