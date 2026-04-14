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
  const [calendarEvents, setCalendarEventsLocal] = useState([]);
  const [noteText, setNoteTextLocal] = useState("");
  const [noteTitle, setNoteTitleLocal] = useState("Not Defteri");
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const tasksSaveTimer = useRef(null);
  const noteSaveTimer = useRef(null);
  const pendingNoteData = useRef({});

  // ------ Firestore listeners ------
  useEffect(() => {
    if (!uid) {
      setTasksLocal([]);
      setWeeklyEventsLocal([]);
      setCalendarEventsLocal([]);
      setLoaded(false);
      return;
    }

    let tasksLoaded = false;
    let eventsLoaded = false;
    let calLoaded = false;
    let notesLoaded = false;

    const checkLoaded = () => {
      if (tasksLoaded && eventsLoaded && calLoaded && notesLoaded) setLoaded(true);
    };

    const unsubNote = onSnapshot(
      doc(db, "users", uid, "notes", "main"),
      (snap) => {
        if (snap.exists()) {
          setNoteTextLocal(snap.data().text || "");
          setNoteTitleLocal(snap.data().title || "Not Defteri");
        } else {
          setNoteTextLocal("");
          setNoteTitleLocal("Not Defteri");
        }
        notesLoaded = true;
        checkLoaded();
      }
    );

    const unsubTasks = onSnapshot(
      collection(db, "users", uid, "tasks"),
      (snap) => {
        setTasksLocal(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
        tasksLoaded = true;
        checkLoaded();
      }
    );

    const unsubEvents = onSnapshot(
      collection(db, "users", uid, "weeklyEvents"),
      (snap) => {
        setWeeklyEventsLocal(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
        eventsLoaded = true;
        checkLoaded();
      }
    );

    const unsubCal = onSnapshot(
      collection(db, "users", uid, "calendarEvents"),
      (snap) => {
        setCalendarEventsLocal(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
        calLoaded = true;
        checkLoaded();
      }
    );

    return () => { unsubTasks(); unsubEvents(); unsubCal(); unsubNote(); };
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
    }, 3000);
  };

  const saveWeeklyEventsToFirestore = async (updated) => {
    if (!uid) return;
    for (const event of updated) {
      const { id, ...data } = event;
      await setDoc(doc(db, "users", uid, "weeklyEvents", String(id)), data);
    }
  };

  const saveCalendarEventsToFirestore = async (updated) => {
    if (!uid) return;
    for (const event of updated) {
      const { id, ...data } = event;
      await setDoc(doc(db, "users", uid, "calendarEvents", String(id)), data);
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

  const deleteCalendarEventFromFirestore = async (id) => {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "calendarEvents", String(id)));
  };

  // ------ Public setters ------
  const setTasks = (updater) => {
    setTasksLocal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const prevIds = new Set(prev.map((t) => t.id));
      const nextIds = new Set(next.map((t) => t.id));
      prevIds.forEach((id) => { if (!nextIds.has(id)) deleteTaskFromFirestore(id); });
      saveTasksToFirestore(next);
      return next;
    });
  };

  const setWeeklyEvents = (updater) => {
    setWeeklyEventsLocal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const prevIds = new Set(prev.map((e) => e.id));
      const nextIds = new Set(next.map((e) => e.id));
      prevIds.forEach((id) => { if (!nextIds.has(id)) deleteWeeklyEventFromFirestore(id); });
      saveWeeklyEventsToFirestore(next);
      return next;
    });
  };

  const setCalendarEvents = (updater) => {
    setCalendarEventsLocal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const prevIds = new Set(prev.map((e) => e.id));
      const nextIds = new Set(next.map((e) => e.id));
      prevIds.forEach((id) => { if (!nextIds.has(id)) deleteCalendarEventFromFirestore(id); });
      saveCalendarEventsToFirestore(next);
      return next;
    });
  };

  const setNoteText = (newText) => {
    setNoteTextLocal(newText);
    pendingNoteData.current.text = newText;
    scheduleNoteSave();
  };

  const setNoteTitle = (newTitle) => {
    setNoteTitleLocal(newTitle);
    pendingNoteData.current.title = newTitle;
    scheduleNoteSave();
  };

  const scheduleNoteSave = () => {
    if (!uid) return;
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(() => {
      setDoc(doc(db, "users", uid, "notes", "main"), pendingNoteData.current, { merge: true });
      pendingNoteData.current = {};
    }, 1000);
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
      tasks, setTasks,
      weeklyEvents, setWeeklyEvents,
      calendarEvents, setCalendarEvents,
      noteText, setNoteText,
      noteTitle, setNoteTitle,
      activeTaskId, setActiveTaskId,
      isRunning, setIsRunning,
      loaded,
      completedCount: tasks.filter((item) => item.done).length,
      progress:
        tasks.length === 0
          ? 0
          : Math.round((tasks.filter((item) => item.done).length / tasks.length) * 100),
    }),
    [tasks, weeklyEvents, calendarEvents, noteText, noteTitle, activeTaskId, isRunning, loaded]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
