// Imports at the start of the file
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStorage,
  setStorage,
  removeStorage,
  STORAGE_KEYS,
} from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Declare state variables for the countdown timer
function Page() {
  // Existing state declarations
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownTime, setCountdownTime] = useState(5);
  const [isPaused, setIsPaused] = useState(false);

  // Effect to handle countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountdownActive && countdownTime > 0 && !isPaused) {
      timer = setTimeout(() => {
        setCountdownTime(prev => prev - 1);
      }, 1000);
    } else if (countdownTime === 0) {
      setIsCountdownActive(false);
    }
    return () => clearTimeout(timer);
  }, [countdownTime, isCountdownActive, isPaused]);

  // Function to start the countdown
  const startCountdown = () => {
    setIsCountdownActive(true);
    setCountdownTime(5);
    setIsPaused(false);
  };

  return (
    <div>
      {/* Main content of the component */}

      <Dialog open={isCountdownActive}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>Switch Sides</DialogTitle>
            <DialogDescription>Prepare to switch sides in {countdownTime} seconds.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setIsPaused(prev => !prev)} className="btn">
              {isPaused ? 'Resume' : 'Pause'} Countdown
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Page;
