// deno-lint-ignore-file no-explicit-any

const MAX_DELAY = 2147483647; // 2 ** 31 - 1
const ACCURACY = 250;

export interface Timer {
  state(): "waiting" | "stopped" | "completed";
  stop(): Timer;
  start(): Timer;
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
  let stopRemains: number | null = null;
  let isCompleted = false;

  const timeoutInstance = {} as Timer;
  function stop() {
    if (isCompleted) return timeoutInstance;
    timer && clearTimeout(timer);
    stopRemains = stopRemains ?? waitUntil - Date.now();
    return timeoutInstance;
  }
  function start() {
    if (isCompleted) return timeoutInstance;
    if (typeof stopRemains === "number") {
      waitUntil = Date.now() + stopRemains;
      stopRemains = null;
    }
    const remains = Math.max(0, waitUntil - Date.now());
    if (remains <= ACCURACY) {
      timer = setTimeout(() => {
        isCompleted = true;
        cb();
      }, remains);
    } else {
      timer = setTimeout(start, Math.min(remains >> 1, MAX_DELAY));
    }
    return timeoutInstance;
  }
  function clear() {
    timer && clearTimeout(timer);
    isCompleted = true;
  }
  function state() {
    if (isCompleted) return "completed";
    if (typeof stopRemains === "number") return "stopped";
    return "waiting";
  }

  timeoutInstance.state = state;
  timeoutInstance.start = start;
  timeoutInstance.stop = stop;
  timeoutInstance.clear = clear;

  start();

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
  let stopRemains: number | null = null;
  let isCompleted = false;

  const intervalInstance = {} as Timer;
  function stop() {
    if (isCompleted) return intervalInstance;
    timer && clearTimeout(timer);
    stopRemains = stopRemains ?? waitUntil - Date.now();
    return intervalInstance;
  }
  function start() {
    if (isCompleted) return intervalInstance;
    if (typeof stopRemains === "number") {
      waitUntil = Date.now() + stopRemains;
      stopRemains = null;
    }
    const remains = Math.max(0, waitUntil - Date.now());
    if (remains <= ACCURACY) {
      timer = setTimeout(() => {
        cb();
        waitUntil = parseInterval(waitUntil, interval || 0);
        start();
      }, remains);
    } else {
      timer = setTimeout(start, Math.min(remains >> 1, MAX_DELAY));
    }
    return intervalInstance;
  }
  function clear() {
    timer && clearTimeout(timer);
    isCompleted = true;
  }
  function state() {
    if (isCompleted) return "completed";
    if (typeof stopRemains === "number") return "stopped";
    return "waiting";
  }

  intervalInstance.start = start;
  intervalInstance.stop = stop;
  intervalInstance.clear = clear;
  intervalInstance.state = state;

  start();

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
  while (now > from) {
    from += interval;
  }
  return from;
}
