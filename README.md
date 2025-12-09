# timerider <a href="https://github.com/denostack"><img src="https://raw.githubusercontent.com/denostack/images/main/logo.svg" width="160" align="right" /></a>

<p>
  <a href="https://github.com/denostack/timerider/actions"><img alt="Build" src="https://img.shields.io/github/actions/workflow/status/denostack/timerider/ci.yml?branch=main&logo=github&style=flat-square" /></a>
  <a href="https://codecov.io/gh/denostack/timerider"><img alt="Coverage" src="https://img.shields.io/codecov/c/gh/denostack/timerider?style=flat-square" /></a>
  <img alt="License" src="https://img.shields.io/npm/l/timerider.svg?style=flat-square" />
  <img alt="Language Typescript" src="https://img.shields.io/badge/language-Typescript-007acc.svg?style=flat-square" />
  <br />
  <a href="https://jsr.io/@denostack/timerider"><img alt="JSR version" src="https://jsr.io/badges/@denostack/timerider?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/timerider"><img alt="NPM Version" src="https://img.shields.io/npm/v/timerider.svg?style=flat-square&logo=npm" /></a>
  <a href="https://npmcharts.com/compare/timerider?minimal=true"><img alt="Downloads" src="https://img.shields.io/npm/dt/timerider.svg?style=flat-square" /></a>
</p>

Accurate timers with drift correction, pause/resume, and long delay support.

## Features

Timerider improves upon standard timers in three key ways:

1. **Time Drift Correction**: Automatically corrects time drift for both `setInterval` and `setTimeout`, ensuring more
   accurate timing over long periods.
2. **Long Delay Support**: Handles delays longer than the 32-bit integer limit (`2^31 - 1` ms), which standard timers
   cannot process correctly.
3. **Pause & Resume**: Adds the ability to pause a timer and resume it later, perfect for games or interactive
   applications.

## Installation

### Deno

```bash
deno add jsr:@denostack/timerider
```

### Node.js & Browser

```bash
npm install timerider
```

## Usage

### Timeout

`createTimeout` works like `setTimeout` but returns a `Timer` object with additional control.

```ts
import { createTimeout } from "@denostack/timerider";

// Basic usage
createTimeout(() => {
  console.log("Hello after 1 second");
}, 1000);

// Pause and Resume
const timer = createTimeout(() => {
  console.log("This will run eventually...");
}, 5000);

// Pause the timer
timer.pause();

// Resume after some time
setTimeout(() => {
  timer.resume(); // Will resume waiting for the remaining time
}, 2000);
```

### Interval

`createInterval` works like `setInterval` but with built-in drift correction.

```ts
import { createInterval } from "@denostack/timerider";

createInterval(() => {
  console.log("Tick every 1 second");
}, 1000);
```

### Long Delays

Standard timers fail with delays larger than ~24.8 days (2^31 - 1 milliseconds). Timerider handles this seamlessly.

```ts
import { createTimeout } from "@denostack/timerider";

// Wait for 30 days
const thirtyDays = 1000 * 60 * 60 * 24 * 30;

createTimeout(() => {
  console.log("See you next month!");
}, thirtyDays);
```

## API Reference

### `createTimeout(callback, delay)`

Creates a timer that executes the callback after the specified delay.

- `callback`: Function to execute.
- `delay`: Number (ms) or Date object.
- Returns: `Timer`

### `createInterval(callback, interval, delay?)`

Creates a timer that repeatedly executes the callback at the specified interval.

- `callback`: Function to execute.
- `interval`: Number (ms) for the repetition interval.
- `delay`: (Optional) Number (ms) or Date object for the initial start delay.
- Returns: `Timer`

### `Timer` Interface

The object returned by `createTimeout` and `createInterval`.

```ts
interface Timer {
  /**
   * Returns the current state of the timer.
   * "waiting": Timer is running and waiting for the next execution.
   * "paused": Timer is paused.
   * "completed": Timer has finished (for timeouts) or paused permanently.
   */
  state(): "waiting" | "paused" | "completed";

  /**
   * Pauses the timer. The remaining time is preserved.
   */
  pause(): Timer;

  /**
   * Resumes the timer from where it left off.
   */
  resume(): Timer;

  /**
   * Permanently pauses the timer. Similar to clearTimeout/clearInterval.
   */
  clear(): void;
}
```
