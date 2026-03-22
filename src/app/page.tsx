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

  // Effect to handle countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountdownActive && countdownTime > 0) {
      timer = setTimeout(() => {
        setCountdownTime(countdownTime - 1);
      }, 1000);
    } else if (countdownTime === 0) {
      setIsCountdownActive(false);
    }
    return () => clearTimeout(timer);
  }, [countdownTime, isCountdownActive]);

  // Function to start the countdown
  const startCountdown = () => {
    setIsCountdownActive(true);
    setCountdownTime(5);
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
            <button onClick={() => setIsCountdownActive(false)} className="btn">
              Cancel Countdown
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Page;
