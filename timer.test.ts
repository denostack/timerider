import { assertEquals, assertLess } from "@std/assert";
import { assertSpyCalls, spy } from "@std/testing/mock";
import { createInterval, createTimeout } from "./timer.ts";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- createTimeout Tests ---

Deno.test("createTimeout() - executes callback after delay (number)", async () => {
  const startedAt = Date.now();
  const spyCallback = spy(() => {
    // Check if it ran approximately after 100ms (allow 20ms buffer)
    assertLess(Math.abs(Date.now() - startedAt - 100), 20);
  });

  const timer = createTimeout(spyCallback, 100);
  assertEquals(timer.state(), "waiting");
  assertSpyCalls(spyCallback, 0);

  await sleep(150);

  assertEquals(timer.state(), "completed");
  assertSpyCalls(spyCallback, 1);
});

Deno.test("createTimeout() - executes callback after delay (Date)", async () => {
  const startedAt = Date.now();
  const spyCallback = spy(() => {
    assertLess(Math.abs(Date.now() - startedAt - 100), 20);
  });

  const timer = createTimeout(spyCallback, new Date(Date.now() + 100));
  assertEquals(timer.state(), "waiting");
  assertSpyCalls(spyCallback, 0);

  await sleep(150);

  assertEquals(timer.state(), "completed");
  assertSpyCalls(spyCallback, 1);
});

Deno.test("createTimeout() - can be paused and restarted", async () => {
  const spyCallback = spy(() => {});
  // Start with 100ms delay, but pause immediately
  const timer = createTimeout(spyCallback, 100).pause();
  assertEquals(timer.state(), "paused");

  // Wait longer than the delay
  await sleep(150);
  assertSpyCalls(spyCallback, 0);

  // Restart
  timer.resume();
  assertEquals(timer.state(), "waiting");

  // Wait for the remaining time
  await sleep(150);

  assertEquals(timer.state(), "completed");
  assertSpyCalls(spyCallback, 1);
});

Deno.test("createTimeout() - can be cleared", async () => {
  const spyCallback = spy(() => {});
  const timer = createTimeout(spyCallback, 100);

  // Clear immediately
  timer.clear();
  assertEquals(timer.state(), "completed");

  // Wait longer than the delay
  await sleep(150);

  // Should never be called
  assertSpyCalls(spyCallback, 0);
});

// --- createInterval Tests ---

Deno.test("createInterval() - executes callback repeatedly", async () => {
  const spyCallback = spy(() => {});
  // Run every 50ms
  const timer = createInterval(spyCallback, 50);

  // Wait 225ms (approx 4 calls: 50, 100, 150, 200)
  await sleep(225);

  timer.clear();

  // Check call count (expecting at least 4)
  const calls = spyCallback.calls.length;
  assertEquals(calls >= 4, true, `Expected >= 4 calls, got ${calls}`);
  assertEquals(timer.state(), "completed");
});

Deno.test("createInterval() - executes with initial delay", async () => {
  const spyCallback = spy(() => {});
  // Delay 100ms, then run every 50ms
  const timer = createInterval(spyCallback, 50, 100);

  // Wait 80ms (still in delay)
  await sleep(80);
  assertSpyCalls(spyCallback, 0);

  // Wait another 80ms (total 160ms -> delay passed, 1st interval passed)
  await sleep(80);

  const calls = spyCallback.calls.length;
  assertEquals(calls >= 1, true, `Expected >= 1 calls, got ${calls}`);

  timer.clear();
});

Deno.test("createInterval() - can be paused and restarted", async () => {
  const spyCallback = spy(() => {});
  const timer = createInterval(spyCallback, 50);

  // Allow 2 calls (~100ms)
  await sleep(120);
  const callsBeforePause = spyCallback.calls.length;
  assertEquals(callsBeforePause >= 2, true);

  // Pause
  timer.pause();
  assertEquals(timer.state(), "paused");

  // Wait 200ms (should be no new calls)
  await sleep(200);
  assertSpyCalls(spyCallback, callsBeforePause);

  // Restart
  timer.resume();

  // Wait another 100ms (expect more calls)
  await sleep(120);

  const callsAfterRestart = spyCallback.calls.length;
  assertEquals(callsAfterRestart > callsBeforePause, true);

  timer.clear();
});

Deno.test("createInterval() - can be cleared", async () => {
  const spyCallback = spy(() => {});
  const timer = createInterval(spyCallback, 50);

  // Wait for 1 call
  await sleep(60);
  assertSpyCalls(spyCallback, 1);

  // Clear
  timer.clear();
  assertEquals(timer.state(), "completed");

  // Wait long enough for next interval
  await sleep(100);

  // Should still be 1 call
  assertSpyCalls(spyCallback, 1);
});
