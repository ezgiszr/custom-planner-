import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import {
  collection, doc, onSnapshot, setDoc, deleteDoc
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;

  const [tasks, setTasksLocal] = useState([]);
  const [weeklyEvents, setWeeklyEventsLocal] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Debounce tasks Firestore save (avoid writing every countdown tick)
  const tasksSaveTimer = useRef(null);

  // ------ Firestore listeners ------
  useEffect(() => {
    if (!uid) {
      setTasksLocal([]);
      setWeeklyEventsLocal([]);
      setLoaded(false);
      return;
    }

    let tasksLoaded = false;
    let eventsLoaded = false;

    const checkLoaded = () => {
      if (tasksLoaded && eventsLoaded) setLoaded(true);
    };

    const unsubTasks = onSnapshot(
      collection(db, "users", uid, "tasks"),
      (snap) => {
        const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        setTasksLocal(data);
        tasksLoaded = true;
        checkLoaded();
      }
    );

    const unsubEvents = onSnapshot(
      collection(db, "users", uid, "weeklyEvents"),
      (snap) => {
        const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        setWeeklyEventsLocal(data);
        eventsLoaded = true;
        checkLoaded();
      }
    );

    return () => {
      unsubTasks();
      unsubEvents();
    };
  }, [uid]);

  // ------ Firestore writers ------
  const saveTasksToFirestore = (updatedTasks) => {
    if (!uid) return;
    if (tasksSaveTimer.current) clearTimeout(tasksSaveTimer.current);
    tasksSaveTimer.current = setTimeout(async () => {
      for (const task of updatedTasks) {
        const { id, ...data } = task;
        await setDoc(doc(db, "users", uid, "tasks", String(id)), data);
      }
    }, 3000); // debounce: write at most every 3 seconds
  };

  const saveWeeklyEventsToFirestore = async (updated) => {
    if (!uid) return;
    for (const event of updated) {
      const { id, ...data } = event;
      await setDoc(doc(db, "users", uid, "weeklyEvents", String(id)), data);
    }
  };

  const deleteTaskFromFirestore = async (id) => {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "tasks", String(id)));
  };

  const deleteWeeklyEventFromFirestore = async (id) => {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "weeklyEvents", String(id)));
  };

  // ------ Public setters (update local state + sync Firestore) ------
  const setTasks = (updater) => {
    setTasksLocal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      // Detect deletions
      const prevIds = new Set(prev.map((t) => t.id));
      const nextIds = new Set(next.map((t) => t.id));
      prevIds.forEach((id) => {
        if (!nextIds.has(id)) deleteTaskFromFirestore(id);
      });
      saveTasksToFirestore(next);
      return next;
    });
  };

  const setWeeklyEvents = (updater) => {
    setWeeklyEventsLocal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      // Detect deletions
      const prevIds = new Set(prev.map((e) => e.id));
      const nextIds = new Set(next.map((e) => e.id));
      prevIds.forEach((id) => {
        if (!nextIds.has(id)) deleteWeeklyEventFromFirestore(id);
      });
      saveWeeklyEventsToFirestore(next);
      return next;
    });
  };

  // ------ Timer countdown ------
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
      loaded,
      completedCount: tasks.filter((item) => item.done).length,
      progress:
        tasks.length === 0
          ? 0
          : Math.round(
              (tasks.filter((item) => item.done).length / tasks.length) * 100
            ),
    }),
    [tasks, weeklyEvents, activeTaskId, isRunning, loaded]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
