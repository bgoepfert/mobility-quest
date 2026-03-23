"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStorage,
  setStorage,
  removeStorage,
  STORAGE_KEYS,
} from "@/lib/storage";
import { CountdownDialog } from "@/components/ui/dialog";

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

  const ExerciseRoutine: React.FC = () => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  const routine = MORNING_ROUTINE;

  const currentExercise = routine.exercises[currentExerciseIndex];

  const handleCompleteExercise = () => {
    if (currentExercise?.isSided) {
      if (currentExerciseIndex % 2 === 0) {
        // Considering "left" side when the index is even for this example
        setIsCountdownActive(true);
      } else {
        setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
      }
    } else {
      setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleCountdownComplete = () => {
    setIsCountdownActive(false);
    setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
  };

  if (isCountdownActive) {
    return <CountdownDialog onComplete={handleCountdownComplete} />;
  }

  return (
    <div>
      <h1>{routine.name}</h1>
      <h2>Current Exercise: {currentExercise?.name}</h2>
      <button onClick={handleCompleteExercise}>Complete Exercise</button>
    </div>
  );
};

export default ExerciseRoutine;
