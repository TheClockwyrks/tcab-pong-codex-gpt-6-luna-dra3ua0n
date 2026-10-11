import { describe, expect, it } from "vitest";
import { game } from "./game";
import type { CaromDebugApi } from "./game";
import type { DeepReadonly } from "ts-essentials";

async function setup() {
  const actions = new Map<string, number>();
  const pressed = new Set<string>();
  let muted = false;
  const api = {
    input: {
      register: () => undefined,
      layout: () => null,
      value: (name: string) => actions.get(name) ?? 0,
      pressed: (name: string) => {
        const has = pressed.has(name);
        pressed.delete(name);
        return has;
      },
      pointerSamples: () => [],
      pointer: () => ({ x: 0, y: 0 }),
      pointerPressed: () => false,
      pointerReleased: () => false,
    },
    audio: {
      define: () => undefined,
      load: async () => undefined,
      play: () => undefined,
      setMuted: (v: boolean) => {
        muted = v;
      },
      muted: () => muted,
    },
    diagnostics: { register: () => undefined },
  } as never;
  const [state, debug] = await game.initialize(api);
  return { state, debug: debug as CaromDebugApi, api, actions, pressed };
}

describe("Carom state and simulation", () => {
  it("initializes a complete title world and poses values immutably", async () => {
    const { state, debug } = await setup();
    expect(state.screen).toBe("title");
    expect(state.obstacles).toHaveLength(2);
    const posed = debug.setBallVelocity(state, 300, -40);
    expect(posed.ball?.vx).toBe(300);
    expect(state.ball?.vx).toBe(0);
    expect(debug.snapshot(posed)).toMatchObject({
      version: 1,
      ball: { speed: Math.hypot(300, 40) },
    });
  });

  it("serves after the hold and advances by elapsed seconds", async () => {
    const { state, debug, api } = await setup();
    const playing = debug.setScreen(
      debug.setBallHoldTimer(state, 0.01),
      "countdown",
    );
    const next = game.update(
      playing as DeepReadonly<typeof playing>,
      api,
      0.02,
    );
    expect(next.screen).toBe("playing");
    expect(next.ball?.held).toBe(false);
    expect(next.ball?.vx).toBeLessThan(0);
  });

  it("scores beyond the goal and parks the next serve", async () => {
    const { state, debug, api } = await setup();
    let posed = debug.setScreen(state, "playing");
    posed = debug.setBallHeld(posed, false);
    posed = debug.setBallPosition(posed, 1270, 100);
    posed = debug.setBallVelocity(posed, 700, 0);
    const next = game.update(posed as DeepReadonly<typeof posed>, api, 0.04);
    expect(next.score.p1).toBe(1);
    expect(next.screen).toBe("countdown");
    expect(next.ball?.held).toBe(true);
  });
});
