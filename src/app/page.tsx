"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStorage,
  setStorage,
  removeStorage,
  STORAGE_KEYS,
} from "@/lib/storage";

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  order: number;
  completed: boolean;
  isSided?: boolean;
  sideInstructions?: string;
}

interface Routine {
  id: string;
  name: string;
  type: "morning" | "night";
  totalDuration: number;
  exercises: Exercise[];
}

interface UserProfile {
  totalPoints: number;
  level: number;
  streak: number;
  longestStreak: number;
  totalRoutinesCompleted: number;
}

interface NotificationSettings {
  morningReminder: string;
  nightReminder: string;
}

interface NotificationState {
  morningLastShown: string | null;
  nightLastShown: string | null;
}

const MORNING_ROUTINE: Routine = {
  id: "morning-1",
  name: "Morning Quest",
  type: "morning",
  totalDuration: 10,
  exercises: [
    {
      id: "m1",
      name: "Cat–Cow",
      description:
        "Move between arching your back and rounding it while on all fours.\nGoal: mobilize lower back and thoracic spine.",
      duration: 60,
      order: 1,
      completed: false,
    },
    {
      id: "m2",
      name: "Thread the Needle",
      description:
        "From all fours, slide one arm under your body and gently rotate.\nGoal: release rhomboids and muscles under the scapula.",
      duration: 60,
      order: 2,
      completed: false,
      isSided: true,
      sideInstructions: "30 seconds per side",
    },
    {
      id: "m3",
      name: "Glute Bridge",
      description:
        "Lie on your back, feet flat. Lift hips and squeeze glutes.\nGoal: activate posterior chain, reduce lumbar stress.",
      duration: 90,
      order: 3,
      completed: false,
    },
    {
      id: "m4",
      name: "Bird Dog",
      description:
        "On all fours, extend opposite arm and leg, slow and controlled.\nGoal: build spinal stability and anti-rotation strength.",
      duration: 120,
      order: 4,
      completed: false,
      isSided: true,
      sideInstructions: "60 seconds per side, alternate sides",
    },
    {
      id: "m5",
      name: "Hip CARs",
      description:
        "Standing or on hands/knees, draw slow controlled circles with each hip.\nGoal: maintain lifelong hip mobility.",
      duration: 120,
      order: 5,
      completed: false,
      isSided: true,
      sideInstructions: "60 seconds per hip",
    },
    {
      id: "m6",
      name: "Ankle Knee-Over-Toes Rock",
      description:
        "Standing in a split stance, drive knee forward over toes repeatedly.\nGoal: improve ankle dorsiflexion & protect knees.",
      duration: 60,
      order: 6,
      completed: false,
      isSided: true,
      sideInstructions: "30 seconds per leg",
    },
    {
      id: "m7",
      name: "Wall Slides",
      description:
        'Stand against wall, arms in "W" shape; slide up and down keeping contact.\nGoal: restore scap upward rotation & reduce upper-back tightness.',
      duration: 90,
      order: 7,
      completed: false,
    },
  ],
};

const NIGHT_ROUTINE: Routine = {
  id: "night-1",
  name: "Night Quest",
  type: "night",
  totalDuration: 15,
  exercises: [
    {
      id: "n1",
      name: "90/90 Hip Stretch",
      description:
        "Sit with front and back legs both bent at 90°. Lean forward.\nGoal: improve hip rotation, reduce back compensations.",
      duration: 180,
      order: 1,
      completed: false,
      isSided: true,
      sideInstructions: "90 seconds per side",
    },
    {
      id: "n2",
      name: "Couch Stretch",
      description:
        "Shin against wall, knee down, other foot forward. Lean upright.\nGoal: lengthen psoas/quads, reduce anterior pelvic tilt.",
      duration: 120,
      order: 2,
      completed: false,
      isSided: true,
      sideInstructions: "60 seconds per leg",
    },
    {
      id: "n3",
      name: "Puppy Pose",
      description:
        "Kneeling, walk hands forward and sink chest to floor while hips stay up.\nGoal: open upper back, lats, and chest.",
      duration: 120,
      order: 3,
      completed: false,
    },
    {
      id: "n4",
      name: "Prone Y-T-W",
      description:
        "Lying face down, lift arms into a Y, then T, then W, slow reps.\nGoal: strengthen mid-back, correct scapular imbalance.",
      duration: 180,
      order: 4,
      completed: false,
    },
    {
      id: "n5",
      name: "Dead Bug",
      description:
        "On your back, arms up, legs in tabletop. Lower opposite arm/leg slowly.\nGoal: improve core coordination & spinal support.",
      duration: 120,
      order: 5,
      completed: false,
      isSided: true,
      sideInstructions: "Work both sides equally",
    },
    {
      id: "n6",
      name: "Neck Circles",
      description:
        "Slow, controlled rotations. Stay pain-free.\nGoal: preserve cervical mobility.",
      duration: 90,
      order: 6,
      completed: false,
    },
    {
      id: "n7",
      name: "Diaphragmatic Breathing",
      description:
        "Lie on your back with feet on couch/chair; breathe into belly.\nGoal: downregulate tension and improve next-day mobility.",
      duration: 90,
      order: 7,
      completed: false,
    },
  ],
};

const ACHIEVEMENTS = [
  {
    id: "a1",
    name: "First Steps",
    description: "Complete your first exercise",
    icon: "🎯",
    points: 10,
    unlocked: false,
  },
  {
    id: "a2",
    name: "Early Bird",
    description: "Complete morning routine 3 days in a row",
    icon: "🌅",
    points: 50,
    unlocked: false,
  },
  {
    id: "a3",
    name: "Night Owl",
    description: "Complete evening routine 3 days in a row",
    icon: "🦉",
    points: 50,
    unlocked: false,
  },
  {
    id: "a4",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    points: 100,
    unlocked: false,
  },
  {
    id: "a5",
    name: "Perfect Day",
    description: "Complete both routines in one day",
    icon: "⭐",
    points: 75,
    unlocked: false,
  },
  {
    id: "a6",
    name: "Centurion",
    description: "Reach 100 exercises completed",
    icon: "💯",
    points: 200,
    unlocked: false,
  },
  {
    id: "a7",
    name: "Habit Creator",
    description: "Maintain a 30-day streak",
    icon: "🌟",
    points: 300,
    unlocked: false,
  },
  {
    id: "a8",
    name: "Mobility Master",
    description: "Reach Level 10",
    icon: "👑",
    points: 500,
    unlocked: false,
  },
];

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resetRoutineExercises(routine: Routine): Routine {
  return {
    ...routine,
    exercises: routine.exercises.map((e) => ({ ...e, completed: false })),
  };
}

function calculateStreak(dailyCompletions: string[]): number {
  if (dailyCompletions.length === 0) return 0;

  const sortedDates = [...dailyCompletions].sort((a, b) => b.localeCompare(a));
  const today = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (!sortedDates.includes(today) && !sortedDates.includes(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let startDate = new Date(today);

  if (!sortedDates.includes(today) && sortedDates.includes(yesterdayStr)) {
    startDate = new Date(yesterday);
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = startDate.toISOString().split("T")[0];
    if (sortedDates.includes(dateStr)) {
      streak++;
      startDate.setDate(startDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getRoutineTypeFromId(routineId: string): "morning" | "night" | null {
  if (routineId.startsWith("morning")) return "morning";
  if (routineId.startsWith("night")) return "night";
  return null;
}

function calculateRoutineStreak(
  completions: Array<{
    routineId: string;
    completedAt: string;
  }>,
  routineType: "morning" | "night"
): number {
  const routineCompletions = completions
    .filter((c) => getRoutineTypeFromId(c.routineId) === routineType)
    .map((c) => c.completedAt.split("T")[0])
    .filter((date, index, self) => self.indexOf(date) === index);

  if (routineCompletions.length === 0) return 0;

  const sortedDates = [...routineCompletions].sort((a, b) =>
    b.localeCompare(a)
  );
  const today = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (!sortedDates.includes(today) && !sortedDates.includes(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let startDate = new Date(today);

  if (!sortedDates.includes(today) && sortedDates.includes(yesterdayStr)) {
    startDate = new Date(yesterday);
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = startDate.toISOString().split("T")[0];
    if (sortedDates.includes(dateStr)) {
      streak++;
      startDate.setDate(startDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function hasPerfectDay(
  completions: Array<{
    routineId: string;
    completedAt: string;
  }>,
  date: string
): boolean {
  const dayCompletions = completions.filter(
    (c) => c.completedAt.split("T")[0] === date
  );
  const hasMorning = dayCompletions.some(
    (c) => getRoutineTypeFromId(c.routineId) === "morning"
  );
  const hasNight = dayCompletions.some(
    (c) => getRoutineTypeFromId(c.routineId) === "night"
  );
  return hasMorning && hasNight;
}

export default function HabitTrackerPage() {
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentSide, setCurrentSide] = useState<"left" | "right" | "both">(
    "both"
  );
  const currentSideRef = useRef<"left" | "right" | "both">("both");
  const [sideTimeRemaining, setSideTimeRemaining] = useState<number>(0);
  const [morningRoutine, setMorningRoutine] =
    useState<Routine>(MORNING_ROUTINE);
  const [nightRoutine, setNightRoutine] = useState<Routine>(NIGHT_ROUTINE);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    totalPoints: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    totalRoutinesCompleted: 0,
  });
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"morning" | "night">("morning");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      morningReminder: "08:00",
      nightReminder: "20:00",
    });

  useEffect(() => {
    const storedRoutines = getStorage<{ morning: Routine; night: Routine }>(
      STORAGE_KEYS.ROUTINES,
      { morning: MORNING_ROUTINE, night: NIGHT_ROUTINE }
    );

    // Check for daily reset
    const lastReset = getStorage<string>(STORAGE_KEYS.LAST_RESET, "");
    const today = getTodayDateString();

    let morning = storedRoutines.morning;
    let night = storedRoutines.night;

    if (lastReset !== today) {
      morning = resetRoutineExercises(morning);
      night = resetRoutineExercises(night);
      setStorage(STORAGE_KEYS.LAST_RESET, today);
    }

    const storedProfile = getStorage<UserProfile>(STORAGE_KEYS.PROFILE, {
      totalPoints: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      totalRoutinesCompleted: 0,
    });
    const storedAchievements = getStorage<typeof ACHIEVEMENTS>(
      STORAGE_KEYS.ACHIEVEMENTS,
      ACHIEVEMENTS
    );
    const storedNotifications = getStorage<NotificationSettings>(
      STORAGE_KEYS.NOTIFICATIONS,
      {
        morningReminder: "10:00",
        nightReminder: "19:00",
      }
    );
    const dailyCompletions = getStorage<string[]>(
      STORAGE_KEYS.DAILY_COMPLETIONS,
      []
    );

    const currentStreak = calculateStreak(dailyCompletions);
    const updatedProfile = {
      ...storedProfile,
      streak: currentStreak,
      longestStreak: Math.max(storedProfile.longestStreak, currentStreak),
    };

    setMorningRoutine(morning);
    setNightRoutine(night);
    setUserProfile(updatedProfile);
    setAchievements(storedAchievements);
    setNotificationSettings(storedNotifications);
    setIsInitialized(true);
  }, []);

  // Daily Reset Timer
  useEffect(() => {
    if (!isInitialized) return;

    const checkDailyReset = () => {
      const lastReset = getStorage<string>(STORAGE_KEYS.LAST_RESET, "");
      const today = getTodayDateString();

      if (lastReset !== today) {
        setMorningRoutine((prev) => resetRoutineExercises(prev));
        setNightRoutine((prev) => resetRoutineExercises(prev));
        setStorage(STORAGE_KEYS.LAST_RESET, today);
      }
    };

    const interval = setInterval(checkDailyReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    setStorage(STORAGE_KEYS.ROUTINES, {
      morning: morningRoutine,
      night: nightRoutine,
    });
  }, [morningRoutine, nightRoutine, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    setStorage(STORAGE_KEYS.PROFILE, userProfile);
  }, [userProfile, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    setStorage(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }, [achievements, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notificationSettings);
  }, [notificationSettings, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;

    if (!("Notification" in window)) {
      return;
    }

    const showNotification = (routineType: "morning" | "night") => {
      if (Notification.permission !== "granted") {
        return;
      }

      try {
        const routineName =
          routineType === "morning" ? "Morning Quest" : "Night Quest";
        const notification = new Notification("Mobility Quest Reminder", {
          body: `Time for your ${routineName}! Let's keep that streak going! 🔥`,
          icon: "/favicon-32x32.png",
          tag: `mobility-quest-${routineType}`,
          requireInteraction: true,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error("Failed to create notification:", error);
      }
    };

    const checkAndShowNotification = (
      reminderTime: string,
      routineType: "morning" | "night"
    ) => {
      if (Notification.permission !== "granted") {
        return;
      }

      const notificationState = getStorage<NotificationState>(
        STORAGE_KEYS.NOTIFICATION_STATE,
        { morningLastShown: null, nightLastShown: null }
      );

      const today = getTodayDateString();
      const lastShownKey =
        routineType === "morning" ? "morningLastShown" : "nightLastShown";

      if (notificationState[lastShownKey] === today) {
        return;
      }

      const [hours, minutes] = reminderTime.split(":").map(Number);
      const now = new Date();
      const reminderDate = new Date(now);
      reminderDate.setHours(hours, minutes, 0, 0);

      const nowTime = now.getTime();
      const reminderTimeMs = reminderDate.getTime();

      if (nowTime >= reminderTimeMs) {
        showNotification(routineType);
        const updatedState: NotificationState = {
          ...notificationState,
          [lastShownKey]: today,
        };
        setStorage(STORAGE_KEYS.NOTIFICATION_STATE, updatedState);
      }
    };

    const checkNotifications = () => {
      if (Notification.permission === "granted") {
        checkAndShowNotification(
          notificationSettings.morningReminder,
          "morning"
        );
        checkAndShowNotification(notificationSettings.nightReminder, "night");
      }
    };

    const initializeNotifications = () => {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            setTimeout(() => {
              checkNotifications();
            }, 1000);
          }
        });
      } else if (Notification.permission === "granted") {
        setTimeout(() => {
          checkNotifications();
        }, 1000);
      }
    };

    initializeNotifications();

    const interval = setInterval(() => {
      checkNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [isInitialized, notificationSettings]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
        if (
          activeRoutine &&
          activeRoutine.exercises[currentExerciseIndex].isSided
        ) {
          const current = currentSideRef.current;
          const exercise = activeRoutine.exercises[currentExerciseIndex];
          setSideTimeRemaining((prev) => {
            const newTime = Math.max(0, prev - 1);
            if (newTime === 0 && current === "left") {
              setCurrentSide("right");
              currentSideRef.current = "right";
              return exercise.duration / 2;
            }
            return newTime;
          });
        }
      }, 1000);
    } else if (timeRemaining === 0 && isPlaying) {
      setIsPlaying(false);
      handleExerciseComplete();
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, activeRoutine, currentExerciseIndex]);

  const startExercise = (routine: Routine, index: number) => {
    setActiveRoutine(routine);
    setCurrentExerciseIndex(index);
    setTimeRemaining(routine.exercises[index].duration);

    const exercise = routine.exercises[index];
    if (exercise.isSided) {
      setCurrentSide("left");
      currentSideRef.current = "left";
      setSideTimeRemaining(exercise.duration / 2);
    } else {
      setCurrentSide("both");
      currentSideRef.current = "both";
      setSideTimeRemaining(0);
    }
    setIsPlaying(false);
  };

  const handleExerciseComplete = () => {
    if (!activeRoutine) return;

    const updatedRoutine =
      activeRoutine.type === "morning"
        ? { ...morningRoutine }
        : { ...nightRoutine };

    const exercise = updatedRoutine.exercises[currentExerciseIndex];
    const oldLevel = userProfile.level;
    const pointsEarned = 10;
    exercise.completed = true;

    // Update user profile
    const newTotalPoints = userProfile.totalPoints + pointsEarned;
    const newLevel = Math.floor(newTotalPoints / 100) + 1;

    setUserProfile((prev) => ({
      ...prev,
      totalPoints: newTotalPoints,
      level: newLevel,
    }));

    // Show level up animation if leveled up
    if (newLevel > oldLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }

    // Update achievements
    updateAchievements(updatedRoutine);

    // Save routine
    if (activeRoutine.type === "morning") {
      setMorningRoutine(updatedRoutine);
    } else {
      setNightRoutine(updatedRoutine);
    }

    // Show celebration
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1500);

    // Move to next exercise
    if (currentExerciseIndex < updatedRoutine.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setTimeRemaining(
        updatedRoutine.exercises[currentExerciseIndex + 1].duration
      );
      const nextExercise = updatedRoutine.exercises[currentExerciseIndex + 1];
      if (nextExercise.isSided) {
        setCurrentSide("left");
        currentSideRef.current = "left";
        setSideTimeRemaining(nextExercise.duration / 2);
      } else {
        setCurrentSide("both");
        currentSideRef.current = "both";
        setSideTimeRemaining(0);
      }
    } else {
      handleRoutineComplete(updatedRoutine);
    }
  };

  const handleRoutineComplete = (routine: Routine) => {
    const today = getTodayDateString();
    const dailyCompletions = getStorage<string[]>(
      STORAGE_KEYS.DAILY_COMPLETIONS,
      []
    );

    if (!dailyCompletions.includes(today)) {
      dailyCompletions.push(today);
      setStorage(STORAGE_KEYS.DAILY_COMPLETIONS, dailyCompletions);
    }

    const newStreak = calculateStreak(dailyCompletions);
    const newProfile = {
      ...userProfile,
      totalRoutinesCompleted: userProfile.totalRoutinesCompleted + 1,
      streak: newStreak,
      longestStreak: Math.max(userProfile.longestStreak, newStreak),
    };
    setUserProfile(newProfile);

    const completedExerciseIds = routine.exercises
      .filter((e) => e.completed)
      .map((e) => e.id);
    const points = completedExerciseIds.length * 10;

    const completions = getStorage<
      Array<{
        routineId: string;
        exerciseIds: string[];
        points: number;
        completedAt: string;
      }>
    >(STORAGE_KEYS.COMPLETIONS, []);

    completions.unshift({
      routineId: routine.id,
      exerciseIds: completedExerciseIds,
      points,
      completedAt: new Date().toISOString(),
    });

    setStorage(STORAGE_KEYS.COMPLETIONS, completions);

    setTimeout(() => {
      updateAchievements(routine);
    }, 0);

    setActiveRoutine(null);
  };

  const updateAchievements = (routine?: Routine) => {
    const currentMorning =
      routine?.type === "morning" ? routine : morningRoutine;
    const currentNight = routine?.type === "night" ? routine : nightRoutine;
    const totalExercisesCompleted =
      currentMorning.exercises.filter((e) => e.completed).length +
      currentNight.exercises.filter((e) => e.completed).length;

    const completions = getStorage<
      Array<{
        routineId: string;
        exerciseIds: string[];
        points: number;
        completedAt: string;
      }>
    >(STORAGE_KEYS.COMPLETIONS, []);

    const morningStreak = calculateRoutineStreak(completions, "morning");
    const nightStreak = calculateRoutineStreak(completions, "night");

    const allDates = completions
      .map((c) => c.completedAt.split("T")[0])
      .filter((date, index, self) => self.indexOf(date) === index);
    const hasAnyPerfectDay = allDates.some((date) =>
      hasPerfectDay(completions, date)
    );

    setAchievements((prev) =>
      prev.map((a) => {
        if (a.id === "a1" && totalExercisesCompleted >= 1)
          return { ...a, unlocked: true };
        if (a.id === "a2" && morningStreak >= 3)
          return { ...a, unlocked: true };
        if (a.id === "a3" && nightStreak >= 3) return { ...a, unlocked: true };
        if (a.id === "a4" && userProfile.streak >= 7)
          return { ...a, unlocked: true };
        if (a.id === "a5" && hasAnyPerfectDay) return { ...a, unlocked: true };
        if (a.id === "a6" && totalExercisesCompleted >= 100)
          return { ...a, unlocked: true };
        if (a.id === "a7" && userProfile.streak >= 30)
          return { ...a, unlocked: true };
        if (a.id === "a8" && userProfile.level >= 10)
          return { ...a, unlocked: true };
        return a;
      })
    );
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetTimer = () => {
    if (activeRoutine) {
      setTimeRemaining(activeRoutine.exercises[currentExerciseIndex].duration);
      const exercise = activeRoutine.exercises[currentExerciseIndex];
      if (exercise.isSided) {
        setCurrentSide("left");
        currentSideRef.current = "left";
        setSideTimeRemaining(exercise.duration / 2);
      }
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResetProgress = () => {
    if (
      !confirm(
        "Are you sure you want to reset all progress? This cannot be undone!"
      )
    ) {
      return;
    }

    removeStorage(STORAGE_KEYS.PROFILE);
    removeStorage(STORAGE_KEYS.ACHIEVEMENTS);
    removeStorage(STORAGE_KEYS.COMPLETIONS);
    removeStorage(STORAGE_KEYS.DAILY_COMPLETIONS);

    setUserProfile({
      totalPoints: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      totalRoutinesCompleted: 0,
    });

    setAchievements(ACHIEVEMENTS);

    const resetMorningRoutine = {
      ...MORNING_ROUTINE,
      exercises: MORNING_ROUTINE.exercises.map((e) => ({
        ...e,
        completed: false,
      })),
    };
    const resetNightRoutine = {
      ...NIGHT_ROUTINE,
      exercises: NIGHT_ROUTINE.exercises.map((e) => ({
        ...e,
        completed: false,
      })),
    };

    setMorningRoutine(resetMorningRoutine);
    setNightRoutine(resetNightRoutine);
    setStorage(STORAGE_KEYS.ROUTINES, {
      morning: resetMorningRoutine,
      night: resetNightRoutine,
    });
  };

  const nextLevelPoints = userProfile.level * 100;
  const progressToNextLevel = ((userProfile.totalPoints % 100) / 100) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a2e] font-mono">
      {/* Scanline effect overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[ repeating-linear-gradient(0deg,transparent,transparent_2px,#000_2px,#000_4px) ]" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl overflow-x-hidden">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(true)}
          className="absolute top-0 right-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xl md:text-3xl"
          style={{
            fontFamily: '"Press Start 2P", monospace',
          }}
        >
          ⚙️
        </motion.button>
        <div className="space-y-6 w-full">
          {/* Pixel Art Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2 relative"
          >
            <h1
              className="text-4xl md:text-6xl font-black text-[#00ff41] tracking-wider"
              style={{
                textShadow: "4px 4px 0px #006633, -2px -2px 0px #00cc33",
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              MOBILITY QUEST
            </h1>
            <div
              className="text-[#ffd700] text-sm md:text-base tracking-wide"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              ◆ LEVEL UP YOUR BODY ◆
            </div>
          </motion.div>

          {/* Retro Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="border-4 border-[#ffd700] bg-[#0d0d1a] p-4 relative"
            style={{
              boxShadow: "8px 8px 0px #ffd700, 12px 12px 0px #006633",
            }}
          >
            {/* Corner decorations */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#00ff41]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#00ff41]" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#00ff41]" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#00ff41]" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center border-2 border-[#00ff41] p-3 bg-[#1a1a2e]">
                <div
                  className="text-2xl md:text-3xl font-bold text-[#00ff41]"
                  style={{ textShadow: "2px 2px 0px #006633" }}
                >
                  LVL {userProfile.level}
                </div>
                <div
                  className="text-xs text-[#ffd700] mt-1"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  LEVEL
                </div>
              </div>
              <div className="text-center border-2 border-[#ff6b6b] p-3 bg-[#1a1a2e]">
                <div
                  className="text-2xl md:text-3xl font-bold text-[#ff6b6b]"
                  style={{ textShadow: "2px 2px 0px #cc0000" }}
                >
                  {userProfile.totalPoints}
                </div>
                <div
                  className="text-xs text-[#ffd700] mt-1"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  POINTS
                </div>
              </div>
              <div className="text-center border-2 border-[#ff9500] p-3 bg-[#1a1a2e]">
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="text-2xl md:text-3xl font-bold text-[#ff9500]"
                    style={{ textShadow: "2px 2px 0px #cc6600" }}
                  >
                    {userProfile.streak}
                  </div>
                  <div className="text-2xl">🔥</div>
                </div>
                <div
                  className="text-xs text-[#ffd700] mt-1"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  STREAK
                </div>
              </div>
              <div className="text-center border-2 border-[#4ecdc4] p-3 bg-[#1a1a2e]">
                <div
                  className="text-2xl md:text-3xl font-bold text-[#4ecdc4]"
                  style={{ textShadow: "2px 2px 0px #006666" }}
                >
                  {userProfile.totalRoutinesCompleted}
                </div>
                <div
                  className="text-xs text-[#ffd700] mt-1"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  QUESTS
                </div>
              </div>
            </div>

            {/* XP Bar */}
            <div className="mt-4 space-y-2">
              <div
                className="flex justify-between text-xs text-[#ffd700]"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                <span>XP TO NEXT LEVEL</span>
                <span>
                  {userProfile.totalPoints} / {nextLevelPoints}
                </span>
              </div>
              <div className="h-6 border-4 border-[#00ff41] bg-[#0d0d1a] relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextLevel}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-linear-to-r from-[#006633] to-[#00ff41] relative"
                  style={{
                    boxShadow: "inset 0 0 10px rgba(0,255,65,0.5)",
                  }}
                >
                  {/* Animated pattern */}
                  <div className="absolute inset-0 opacity-30 bg-[ repeating-linear-gradient(90deg,transparent,transparent_4px,#00ff41_4px,#00ff41_8px) ]" />
                </motion.div>
                {/* Retro bar ends */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ffd700]" />
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#ffd700]" />
              </div>
            </div>
          </motion.div>

          {/* Achievement Collection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border-4 border-[#9b59b6] bg-[#0d0d1a] p-4"
            style={{
              boxShadow: "8px 8px 0px #9b59b6, 12px 12px 0px #6c3483",
            }}
          >
            <h2
              className="text-lg text-[#ffd700] mb-4"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                textShadow: "2px 2px 0px #6c3483",
              }}
            >
              ◆ BADGES ◆
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 border-2 text-center transition-all ${
                    achievement.unlocked
                      ? "border-[#ffd700] bg-[#1a1a2e]"
                      : "border-[#333] bg-[#0d0d1a] opacity-40 grayscale"
                  }`}
                  style={{
                    boxShadow: achievement.unlocked
                      ? "4px 4px 0px #ffd700"
                      : "4px 4px 0px #333",
                  }}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div
                    className="text-xs text-[#ffd700] mb-1"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    {achievement.name}
                  </div>
                  <div className="text-[10px] text-[#888] mb-2 leading-tight">
                    {achievement.description}
                  </div>
                  <div
                    className="text-xs text-[#00ff41]"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    +{achievement.points} XP
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quest Selection Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Pixel Tab Buttons */}
            <div className="flex gap-2 mb-4">
              <PixelTabButton
                active={activeTab === "morning"}
                onClick={() => setActiveTab("morning")}
                icon="🌅"
                label="MORNING"
              />
              <PixelTabButton
                active={activeTab === "night"}
                onClick={() => setActiveTab("night")}
                icon="🌙"
                label="NIGHT"
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "morning" ? (
                  <RoutineCard
                    routine={morningRoutine}
                    onStart={(index) => startExercise(morningRoutine, index)}
                  />
                ) : (
                  <RoutineCard
                    routine={nightRoutine}
                    onStart={(index) => startExercise(nightRoutine, index)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Active Exercise Modal */}
      <AnimatePresence>
        {activeRoutine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl border-4 border-[#00ff41] bg-[#0d0d1a] p-6"
              style={{
                boxShadow: "12px 12px 0px #00ff41, 16px 16px 0px #006633",
              }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div
                  className="text-2xl text-[#ffd700]"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  {activeRoutine.type === "morning" ? "MORNING" : "NIGHT"}
                </div>
                <div
                  className="text-xl text-[#00ff41] mt-2"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  {activeRoutine.exercises[currentExerciseIndex].name}
                </div>
                <div className="text-sm text-[#888] mt-2">
                  EXERCISE {currentExerciseIndex + 1} /{" "}
                  {activeRoutine.exercises.length}
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
                  transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
                  className="text-7xl md:text-8xl font-black text-[#00ff41]"
                  style={{
                    textShadow: "4px 4px 0px #006633, -2px -2px 0px #00cc33",
                    fontFamily: '"Press Start 2P", monospace',
                    lineHeight: 1.2,
                  }}
                >
                  {formatTime(timeRemaining)}
                </motion.div>

                {/* Side indicator for bilateral exercises */}
                {activeRoutine.exercises[currentExerciseIndex].isSided && (
                  <div className="mt-4 space-y-3">
                    <div
                      className="text-sm text-[#ffd700]"
                      style={{ fontFamily: '"Press Start 2P", monospace' }}
                    >
                      SWITCH SIDES:
                    </div>
                    <div className="flex justify-center gap-4">
                      <SideIndicator
                        side="left"
                        active={currentSide === "left"}
                        timeRemaining={
                          currentSide === "left" ? sideTimeRemaining : 0
                        }
                        totalTime={
                          activeRoutine.exercises[currentExerciseIndex]
                            .duration / 2
                        }
                      />
                      <SideIndicator
                        side="right"
                        active={currentSide === "right"}
                        timeRemaining={
                          currentSide === "right" ? sideTimeRemaining : 0
                        }
                        totalTime={
                          activeRoutine.exercises[currentExerciseIndex]
                            .duration / 2
                        }
                      />
                    </div>
                    <div className="text-xs text-[#888] mt-2 px-4 py-2 border-2 border-[#333] bg-[#1a1a2e]">
                      {
                        activeRoutine.exercises[currentExerciseIndex]
                          .sideInstructions
                      }
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-4 h-4 border-2 border-[#00ff41] bg-[#0d0d1a]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        ((activeRoutine.exercises[currentExerciseIndex]
                          .duration -
                          timeRemaining) /
                          activeRoutine.exercises[currentExerciseIndex]
                            .duration) *
                        100
                      }%`,
                    }}
                    className="h-full bg-[#00ff41]"
                  />
                </div>
              </div>

              {/* Exercise Description */}
              <div className="mb-6 p-4 border-2 border-[#333] bg-[#1a1a2e]">
                <p className="text-sm leading-relaxed whitespace-pre-line text-[#ddd]">
                  {activeRoutine.exercises[currentExerciseIndex].description}
                </p>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center gap-4 mb-4">
                <PixelButton
                  onClick={resetTimer}
                  variant="secondary"
                  label="RESET"
                />
                <PixelButton
                  onClick={togglePlay}
                  variant={isPlaying ? "pause" : "play"}
                  label={isPlaying ? "PAUSE" : "START"}
                />
              </div>

              <PixelButton
                onClick={() => setActiveRoutine(null)}
                variant="close"
                label="CLOSE"
                fullWidth
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/60"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-8xl md:text-9xl"
            >
              ⭐
            </motion.div>
            <div
              className="absolute text-4xl md:text-5xl text-[#ffd700] mt-32"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                textShadow: "3px 3px 0px #6c3483",
              }}
            >
              +10 XP!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/80"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="text-center"
            >
              <div className="text-6xl md:text-8xl mb-4">🎮</div>
              <div
                className="text-4xl md:text-6xl text-[#ffd700] mb-4"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  textShadow: "4px 4px 0px #6c3483",
                }}
              >
                LEVEL UP!
              </div>
              <div
                className="text-3xl md:text-4xl text-[#00ff41]"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  textShadow: "3px 3px 0px #006633",
                }}
              >
                LVL {userProfile.level}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md border-4 border-[#ffd700] bg-[#0d0d1a] p-6"
              style={{
                boxShadow: "12px 12px 0px #ffd700, 16px 16px 0px #6c3483",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-2xl text-[#ffd700]"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  SETTINGS
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 border-2 border-[#ffd700] bg-[#0d0d1a] text-[#ffd700] flex items-center justify-center text-lg"
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    boxShadow: "2px 2px 0px #ffd700",
                  }}
                >
                  ✕
                </motion.button>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    className="block text-sm text-[#ffd700] mb-2"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    MORNING QUEST REMINDER
                  </label>
                  <input
                    type="time"
                    value={notificationSettings.morningReminder}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        morningReminder: e.target.value,
                      }))
                    }
                    className="w-full p-3 border-4 border-[#00ff41] bg-[#0d0d1a] text-[#00ff41]"
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      boxShadow: "4px 4px 0px #006633",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm text-[#ffd700] mb-2"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    NIGHT QUEST REMINDER
                  </label>
                  <input
                    type="time"
                    value={notificationSettings.nightReminder}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        nightReminder: e.target.value,
                      }))
                    }
                    className="w-full p-3 border-4 border-[#4ecdc4] bg-[#0d0d1a] text-[#4ecdc4]"
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      boxShadow: "4px 4px 0px #006666",
                    }}
                  />
                </div>

                <div className="pt-4 border-t-2 border-[#333]">
                  <PixelButton
                    onClick={handleResetProgress}
                    variant="close"
                    label="RESET PROGRESS"
                    fullWidth
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-auto py-4 text-center text-[#888] border-t-2 border-[#333] bg-[#0d0d1a]">
        <div
          className="text-xs"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          PRESS START TO LEVEL UP YOUR LIFE!
        </div>
      </footer>
    </div>
  );
}

function RoutineCard({
  routine,
  onStart,
}: {
  routine: Routine;
  onStart: (index: number) => void;
}) {
  const progress = getProgress(routine);
  const completed = routine.exercises.filter((e) => e.completed).length;

  return (
    <div
      className="border-4 border-[#4ecdc4] bg-[#0d0d1a] p-4 w-full overflow-x-hidden"
      style={{ boxShadow: "8px 8px 0px #4ecdc4" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-xl text-[#ffd700]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              textShadow: "2px 2px 0px #006666",
            }}
          >
            {routine.name}
          </h2>
          <div className="text-xs text-[#888] mt-1">
            {completed} / {routine.exercises.length} EXERCISES COMPLETE
          </div>
        </div>
        <div className="text-2xl">⏱️</div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 h-4 border-2 border-[#4ecdc4] bg-[#0d0d1a]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-[#4ecdc4]"
          style={{ boxShadow: "inset 0 0 10px rgba(78,205,196,0.5)" }}
        />
      </div>

      {/* Exercise List */}
      <div
        className="space-y-2 max-h-[500px] overflow-y-auto overflow-x-hidden pr-2 w-full"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#4ecdc4 #0d0d1a" }}
      >
        {routine.exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            className={`p-3 border-2 transition-all ${
              exercise.completed
                ? "border-[#00ff41] bg-[#1a1a2e]"
                : "border-[#333] bg-[#0d0d1a] hover:border-[#4ecdc4]"
            }`}
            style={{
              boxShadow: exercise.completed
                ? "4px 4px 0px #00ff41"
                : "4px 4px 0px #333",
            }}
          >
            <div className="flex items-start justify-between gap-3 w-full min-w-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {exercise.completed ? (
                    <div className="w-6 h-6 flex items-center justify-center bg-[#00ff41] text-[#0d0d1a] text-sm font-bold">
                      ✓
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-[#555]" />
                  )}
                  <span
                    className={`text-sm truncate ${
                      exercise.completed ? "text-[#00ff41]" : "text-[#ddd]"
                    }`}
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    {exercise.name}
                  </span>
                </div>

                <p className="text-xs text-[#888] line-clamp-2 mb-2 wrap-break-word">
                  {exercise.description}
                </p>

                {/* Side indicator for bilateral exercises */}
                {exercise.isSided && (
                  <div
                    className="inline-block px-2 py-1 bg-[#ff9500] text-[#0d0d1a] text-[10px]"
                    style={{ fontFamily: '"Press Start 2P", monospace' }}
                  >
                    {exercise.sideInstructions}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <div
                  className="text-xs text-[#ffd700] px-2 py-1 border-2 border-[#ffd700]"
                  style={{ fontFamily: '"Press Start 2P", monospace' }}
                >
                  {Math.floor(exercise.duration / 60)}:
                  {(exercise.duration % 60).toString().padStart(2, "0")}
                </div>
                <PixelButton
                  onClick={() => onStart(index)}
                  variant={exercise.completed ? "done" : "start"}
                  label={exercise.completed ? "DONE" : "START"}
                  size="small"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function getProgress(routine: Routine) {
  const completed = routine.exercises.filter((e) => e.completed).length;
  return (completed / routine.exercises.length) * 100;
}

function PixelButton({
  onClick,
  variant,
  label,
  fullWidth,
  size = "normal",
}: {
  onClick: () => void;
  variant: "play" | "pause" | "close" | "start" | "done" | "secondary";
  label: string;
  fullWidth?: boolean;
  size?: "normal" | "small";
}) {
  const styles = {
    play: "bg-[#00ff41] text-[#0d0d1a] border-[#00ff41]",
    pause: "bg-[#ff6b6b] text-white border-[#ff6b6b]",
    close: "bg-[#333] text-[#ddd] border-[#555]",
    start: "bg-[#4ecdc4] text-[#0d0d1a] border-[#4ecdc4]",
    done: "bg-[#333] text-[#888] border-[#333] opacity-50 cursor-not-allowed",
    secondary: "bg-[#333] text-[#ddd] border-[#555]",
  };

  const shadows = {
    play: "4px 4px 0px #006633",
    pause: "4px 4px 0px #cc0000",
    close: "4px 4px 0px #000",
    start: "4px 4px 0px #006666",
    done: "4px 4px 0px #000",
    secondary: "4px 4px 0px #000",
  };

  return (
    <motion.button
      whileHover={variant !== "done" ? { scale: 1.05 } : {}}
      whileTap={variant !== "done" ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={variant === "done"}
      className={`${fullWidth ? "w-full" : ""} ${
        styles[variant]
      } border-4 transition-all ${
        size === "small" ? "px-3 py-2 text-xs" : "px-6 py-3 text-sm"
      }`}
      style={{
        fontFamily: '"Press Start 2P", monospace',
        boxShadow: shadows[variant],
        textShadow: "1px 1px 0px rgba(0,0,0,0.3)",
      }}
    >
      {label}
    </motion.button>
  );
}

function PixelTabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex-1 border-4 transition-all py-4 ${
        active
          ? "bg-[#00ff41] text-[#0d0d1a] border-[#00ff41]"
          : "bg-[#0d0d1a] text-[#ffd700] border-[#ffd700]"
      }`}
      style={{
        fontFamily: '"Press Start 2P", monospace',
        boxShadow: active ? "6px 6px 0px #006633" : "6px 6px 0px #6c3483",
        fontSize: "12px",
      }}
    >
      <div className="text-2xl mb-2">{icon}</div>
      {label}
    </motion.button>
  );
}

function SideIndicator({
  side,
  active,
  timeRemaining,
  totalTime,
}: {
  side: "left" | "right";
  active: boolean;
  timeRemaining: number;
  totalTime: number;
}) {
  const progress =
    totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  return (
    <motion.div
      animate={{ scale: active ? 1.1 : 1 }}
      className={`w-22 p-2 border-2 text-center transition-all ${
        active
          ? "border-[#00ff41] bg-[#00ff41] text-[#0d0d1a]"
          : "border-[#333] bg-[#0d0d1a] text-[#666]"
      }`}
    >
      <div
        className="text-sm font-bold mb-1"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        {side === "left" ? "◀ LEFT" : "▶ RIGHT"}
      </div>
      <div
        className="text-lg font-bold mb-1"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        {formatTime(timeRemaining)}
      </div>
      <div className="h-2 border border-current opacity-50">
        <div className="h-full bg-current" style={{ width: `${progress}%` }} />
      </div>
    </motion.div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
