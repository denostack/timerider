// deno-lint-ignore-file no-explicit-any

const MAX_DELAY = 2147483647; // 2 ** 31 - 1
const ACCURACY = 250;

export interface Timer {
  state(): "waiting" | "paused" | "completed";
  pause(): Timer;
  resume(): Timer;
  clear(): void;
}

export function createTimeout(cb: (...args: any[]) => void): Timer;
export function createTimeout(cb: (...args: any[]) => void, ms: number): Timer;
export function createTimeout(cb: (...args: any[]) => void, date: Date): Timer;
export function createTimeout(
  cb: (...args: any[]) => void,
  delay?: number | Date,
): Timer {
  let waitUntil = parseDelay(delay ?? 0);
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pauseRemains: number | null = null;
  let isCompleted = false;

  const timeoutInstance = {} as Timer;
  function pause() {
    if (isCompleted) return timeoutInstance;
    timer && clearTimeout(timer);
    pauseRemains = pauseRemains ?? waitUntil - Date.now();
    return timeoutInstance;
  }
  function resume() {
    if (isCompleted) return timeoutInstance;
    if (typeof pauseRemains === "number") {
      waitUntil = Date.now() + pauseRemains;
      pauseRemains = null;
    }
    const remains = Math.max(0, waitUntil - Date.now());
    if (remains <= ACCURACY) {
      timer = setTimeout(() => {
        isCompleted = true;
        cb();
      }, remains);
    } else {
      timer = setTimeout(resume, Math.min(remains >> 1, MAX_DELAY));
    }
    return timeoutInstance;
  }
  function clear() {
    timer && clearTimeout(timer);
    isCompleted = true;
  }
  function state() {
    if (isCompleted) return "completed";
    if (typeof pauseRemains === "number") return "paused";
    return "waiting";
  }

  timeoutInstance.state = state;
  timeoutInstance.pause = pause;
  timeoutInstance.resume = resume;
  timeoutInstance.clear = clear;

  resume();

  return timeoutInstance;
}

export function createInterval(cb: (...args: any[]) => void): Timer;
export function createInterval(cb: (...args: any[]) => void, interval: number): Timer;
export function createInterval(cb: (...args: any[]) => void, interval: number, delayMs: number): Timer;
export function createInterval(cb: (...args: any[]) => void, interval: number, delayDate: Date): Timer;
export function createInterval(
  cb: (...args: any[]) => void,
  interval?: number,
  delay?: number | Date,
): Timer {
  let waitUntil = parseInterval(parseDelay(delay ?? 0), interval ?? 0);
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pauseRemains: number | null = null;
  let isCompleted = false;

  const intervalInstance = {} as Timer;
  function pause() {
    if (isCompleted) return intervalInstance;
    timer && clearTimeout(timer);
    pauseRemains = pauseRemains ?? waitUntil - Date.now();
    return intervalInstance;
  }
  function resume() {
    if (isCompleted) return intervalInstance;
    if (typeof pauseRemains === "number") {
      waitUntil = Date.now() + pauseRemains;
      pauseRemains = null;
    }
    const remains = Math.max(0, waitUntil - Date.now());
    if (remains <= ACCURACY) {
      timer = setTimeout(() => {
        cb();
        waitUntil = parseInterval(waitUntil, interval || 0);
        resume();
      }, remains);
    } else {
      timer = setTimeout(resume, Math.min(remains >> 1, MAX_DELAY));
    }
    return intervalInstance;
  }
  function clear() {
    timer && clearTimeout(timer);
    isCompleted = true;
  }
  function state() {
    if (isCompleted) return "completed";
    if (typeof pauseRemains === "number") return "paused";
    return "waiting";
  }

  intervalInstance.pause = pause;
  intervalInstance.resume = resume;
  intervalInstance.clear = clear;
  intervalInstance.state = state;

  resume();

  return intervalInstance;
}

function parseDelay(delay: number | Date): number {
  if (delay instanceof Date) {
    return delay.getTime();
  }
  return Date.now() + delay;
}

function parseInterval(from: number, interval: number) {
  if (interval === 0) {
    return from;
  }
  const now = Date.now();
  while (now >= from) {
    from += interval;
  }
  return from;
}
