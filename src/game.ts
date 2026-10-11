import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  AI_DEADZONE,
  AI_HOME_DEADZONE,
  AI_HOME_Y,
  AI_REACT,
  AI_SPEED,
  BALL_R,
  BINDINGS,
  CAROM_DEBUG_VERSION,
  CUES,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  MAX_BOUNCE_ANGLE,
  MAX_SUBSTEP,
  MATCHOVER_ITEMS,
  NET_X,
  OBSTACLE_CENTERS,
  OBSTACLE_HH,
  OBSTACLE_HW,
  OBSTACLES,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  PADDLE_HALF,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  PADDLE_SPEED,
  PADDLE_W,
  PAUSE_ITEMS,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPIN_CLAMP,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  SPEED_CAP,
  SPEED_MULT,
  TITLE_ITEMS,
  TITLE_TEXT,
  TRAIL_TIME,
  WIN_LEAD,
  WIN_SCORE,
} from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";
export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}
export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}
export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}
export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
}
export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
  readonly muted: boolean;
}
type Rect = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};
export interface CaromDebugApi {
  readonly version: number;
  clearWorld(s: DeepReadonly<CaromState>): CaromState;
  spawnBall(s: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(s: DeepReadonly<CaromState>, index: number): CaromState;
  reset(s: DeepReadonly<CaromState>): CaromState;
  reconcile(s: DeepReadonly<CaromState>): CaromState;
  setScreen(s: DeepReadonly<CaromState>, screen: Screen): CaromState;
  setMode(s: DeepReadonly<CaromState>, mode: Mode): CaromState;
  setMenuIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setTitleIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setResumeScreen(
    s: DeepReadonly<CaromState>,
    screen: "countdown" | "playing",
  ): CaromState;
  setScore(s: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(s: DeepReadonly<CaromState>, side: Side | null): CaromState;
  setReceiver(s: DeepReadonly<CaromState>, side: Side): CaromState;
  setPaddleCy(s: DeepReadonly<CaromState>, side: Side, cy: number): CaromState;
  setPaddleVy(s: DeepReadonly<CaromState>, side: Side, vy: number): CaromState;
  setPaddleDriven(
    s: DeepReadonly<CaromState>,
    side: Side,
    driven: boolean,
  ): CaromState;
  setBallPosition(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    s: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(s: DeepReadonly<CaromState>, spin: number): CaromState;
  setBallHeld(s: DeepReadonly<CaromState>, held: boolean): CaromState;
  setBallHoldTimer(s: DeepReadonly<CaromState>, seconds: number): CaromState;
  setBallServeSign(s: DeepReadonly<CaromState>, sign: 1 | -1): CaromState;
  drawBallServeSign(s: DeepReadonly<CaromState>): CaromState;
  setAiTracking(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setAiMovement(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setMuted(s: DeepReadonly<CaromState>, muted: boolean): CaromState;
  snapshot(s: DeepReadonly<CaromState>): object;
  menuItemRect(s: DeepReadonly<CaromState>, index: number): Rect | null;
}
export const BACKGROUND = "#07111d";
const COLORS = {
  ink: "#07111d",
  panel: "#0d1c2a",
  line: "#244052",
  text: "#e9f4f7",
  muted: "#8298a6",
  mint: "#52f2c2",
  coral: "#ff6d79",
  gold: "#ffc966",
  white: "#f4fbff",
};
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const randomSign = (): 1 | -1 => (Math.random() < 0.5 ? -1 : 1);
const makeBall = (): BallState => ({
  x: FIELD_CX,
  y: FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: HOLD_TIME,
  serveSign: randomSign(),
  trail: [],
});
const initial = (muted = false): CaromState => ({
  screen: "title",
  mode: "solo",
  menuIndex: 0,
  titleIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  paddles: {
    left: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
    right: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
  },
  ai: { tracking: true, movement: true },
  receiver: "left",
  ball: makeBall(),
  obstacles: OBSTACLE_CENTERS.map((p, index) => ({ index, cx: p.x, cy: p.y })),
  simTime: 0,
  muted,
});
const rectFor = (screen: Screen, index: number): Rect | null => {
  const count =
    screen === "title"
      ? TITLE_ITEMS.length
      : screen === "howto"
        ? 1
        : screen === "paused"
          ? PAUSE_ITEMS.length
          : screen === "matchover"
            ? MATCHOVER_ITEMS.length
            : 0;
  if (index < 0 || index >= count) return null;
  return {
    x: 450,
    y: (screen === "title" ? 352 : screen === "howto" ? 578 : 410) + index * 58,
    w: 380,
    h: 48,
  };
};
const debug: CaromDebugApi = {
  version: CAROM_DEBUG_VERSION,
  clearWorld: (s) => ({ ...s, ball: null, obstacles: [] }),
  spawnBall: (s) => ({ ...s, ball: makeBall() }),
  spawnObstacle: (s, index) => {
    if (index !== 0 && index !== 1)
      throw new RangeError(`Carom: no obstacle ${index}`);
    return {
      ...s,
      obstacles: [
        ...s.obstacles.filter((o) => o.index !== index),
        {
          index,
          cx: OBSTACLE_CENTERS[index]!.x,
          cy: OBSTACLE_CENTERS[index]!.y,
        },
      ].sort((a, b) => a.index - b.index),
    };
  },
  reset: (s) => initial(s.muted),
  reconcile: (s) => ({ ...s }),
  setScreen: (s, screen) => ({ ...s, screen }),
  setMode: (s, mode) => ({ ...s, mode }),
  setMenuIndex: (s, menuIndex) => ({ ...s, menuIndex }),
  setTitleIndex: (s, titleIndex) => ({ ...s, titleIndex }),
  setResumeScreen: (s, resumeScreen) => ({ ...s, resumeScreen }),
  setScore: (s, p1, p2) => ({ ...s, score: { p1, p2 } }),
  setWinner: (s, winner) => ({ ...s, winner }),
  setReceiver: (s, receiver) => ({ ...s, receiver }),
  setPaddleCy: (s, side, cy) => ({
    ...s,
    paddles: { ...s.paddles, [side]: { ...s.paddles[side], cy } },
  }),
  setPaddleVy: (s, side, drivenVy) => ({
    ...s,
    paddles: { ...s.paddles, [side]: { ...s.paddles[side], drivenVy } },
  }),
  setPaddleDriven: (s, side, driven) => ({
    ...s,
    paddles: { ...s.paddles, [side]: { ...s.paddles[side], driven } },
  }),
  setBallPosition: (s, x, y) => {
    if (!s.ball) throw new Error("Carom: no ball");
    return { ...s, ball: { ...s.ball, x, y } };
  },
  setBallVelocity: (s, vx, vy) => {
    if (!s.ball) throw new Error("Carom: no ball");
    return { ...s, ball: { ...s.ball, vx, vy } };
  },
  setBallSpin: (s, spin) => {
    if (!s.ball) throw new Error("Carom: no ball");
    return { ...s, ball: { ...s.ball, spin } };
  },
  setBallHeld: (s, held) => {
    if (!s.ball) throw new Error("Carom: no ball");
    return { ...s, ball: { ...s.ball, held } };
  },
  setBallHoldTimer: (s, holdTimer) => {
    if (!s.ball) throw new Error("Carom: no ball");
    return { ...s, ball: { ...s.ball, holdTimer } };
  },
  setBallServeSign: (s, serveSign) => {
    if (!s.ball) throw new Error("Carom: no ball");
    return { ...s, ball: { ...s.ball, serveSign } };
  },
  drawBallServeSign: (s) => {
    if (!s.ball) throw new Error("Carom: no ball");
    return { ...s, ball: { ...s.ball, serveSign: randomSign() } };
  },
  setAiTracking: (s, tracking) => ({ ...s, ai: { ...s.ai, tracking } }),
  setAiMovement: (s, movement) => ({ ...s, ai: { ...s.ai, movement } }),
  setMuted: (s, muted) => ({ ...s, muted }),
  snapshot: (s) => ({
    version: CAROM_DEBUG_VERSION,
    ...s,
    ball: s.ball && { ...s.ball, speed: Math.hypot(s.ball.vx, s.ball.vy) },
  }),
  menuItemRect: (s, index) => rectFor(s.screen, index),
};

function circleRect(
  ball: BallState,
  r: { x0: number; y0: number; x1: number; y1: number },
): { ball: BallState; face: "left" | "right" | "top" | "bottom" } | null {
  const l = r.x0 - BALL_R,
    rr = r.x1 + BALL_R,
    t = r.y0 - BALL_R,
    b = r.y1 + BALL_R;
  if (!(ball.x > l && ball.x < rr && ball.y > t && ball.y < b)) return null;
  const depths = [ball.x - l, rr - ball.x, ball.y - t, b - ball.y];
  let m = 0;
  for (let i = 1; i < 4; i++) if (depths[i]! < depths[m]!) m = i;
  const face = (["left", "right", "top", "bottom"] as const)[m]!;
  let { x, y, vx, vy } = ball;
  if (face === "left") {
    x = r.x0 - BALL_R;
    if (vx > 0) vx = -vx;
  } else if (face === "right") {
    x = r.x1 + BALL_R;
    if (vx < 0) vx = -vx;
  } else if (face === "top") {
    y = r.y0 - BALL_R;
    if (vy > 0) vy = -vy;
  } else {
    y = r.y1 + BALL_R;
    if (vy < 0) vy = -vy;
  }
  return { ball: { ...ball, x, y, vx, vy }, face };
}
function transitionMenu(
  s: CaromState,
  item: number,
  api: UpdateApi,
): CaromState {
  if (s.screen === "title") {
    const titleIndex = item;
    if (item === 0 || item === 1) {
      const n = {
        ...initial(s.muted),
        mode: item === 0 ? ("solo" as const) : ("versus" as const),
        screen: "countdown" as const,
        titleIndex,
        menuIndex: 0,
        simTime: s.simTime,
      };
      return n;
    }
    return { ...s, screen: "howto", menuIndex: 0, titleIndex };
  }
  if (s.screen === "howto")
    return {
      ...initial(s.muted),
      titleIndex: s.titleIndex,
      menuIndex: s.titleIndex,
      simTime: s.simTime,
    };
  if (s.screen === "paused") {
    if (item === 0) return { ...s, screen: s.resumeScreen };
    if (item === 1) return startMatch(s, s.mode);
    return {
      ...initial(s.muted),
      titleIndex: s.titleIndex,
      menuIndex: s.titleIndex,
      simTime: s.simTime,
    };
  }
  if (s.screen === "matchover") {
    if (item === 0) return startMatch(s, s.mode);
    return {
      ...initial(s.muted),
      titleIndex: s.titleIndex,
      menuIndex: s.titleIndex,
      simTime: s.simTime,
    };
  }
  void api;
  return s;
}

function startMatch(s: CaromState, mode: Mode): CaromState {
  const fresh = initial(s.muted);
  return {
    ...fresh,
    mode,
    screen: "countdown",
    titleIndex: s.titleIndex,
    simTime: s.simTime,
    ai: s.ai,
    paddles: {
      left: { ...s.paddles.left, cy: FIELD_CY, vy: 0 },
      right: { ...s.paddles.right, cy: FIELD_CY, vy: 0 },
    },
  };
}
export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>): [CaromState, CaromDebugApi] {
    for (const name of ACTIONS)
      api.input.register(name, { keys: [...BINDINGS[name]] });
    api.audio.define(CUES.paddleHit, {
      wave: "square",
      freq: 250,
      freqTo: 150,
      durationMs: 55,
      gain: 0.13,
    });
    api.audio.define(CUES.wallBounce, {
      freq: 430,
      freqTo: 300,
      durationMs: 55,
      gain: 0.1,
    });
    api.audio.define(CUES.obstacleBounce, {
      wave: "triangle",
      freq: 620,
      freqTo: 390,
      durationMs: 80,
      gain: 0.12,
    });
    api.audio.define(CUES.score, {
      wave: "sawtooth",
      freq: 220,
      freqTo: 880,
      durationMs: 280,
      gain: 0.16,
    });
    for (const [name, source] of Object.entries({
      screen: (s: DeepReadonly<CaromState>) => s.screen,
      mode: (s: DeepReadonly<CaromState>) => s.mode,
      score: (s: DeepReadonly<CaromState>) => `${s.score.p1} : ${s.score.p2}`,
      ball: (s: DeepReadonly<CaromState>) =>
        s.ball ? `${s.ball.x.toFixed(0)},${s.ball.y.toFixed(0)}` : "none",
      velocity: (s: DeepReadonly<CaromState>) =>
        s.ball ? `${s.ball.vx.toFixed(0)},${s.ball.vy.toFixed(0)}` : "none",
      speed: (s: DeepReadonly<CaromState>) =>
        s.ball ? Math.hypot(s.ball.vx, s.ball.vy) : 0,
      spin: (s: DeepReadonly<CaromState>) => s.ball?.spin ?? 0,
      left: (s: DeepReadonly<CaromState>) =>
        `${s.paddles.left.cy.toFixed(0)} / ${s.paddles.left.vy.toFixed(0)}`,
      right: (s: DeepReadonly<CaromState>) =>
        `${s.paddles.right.cy.toFixed(0)} / ${s.paddles.right.vy.toFixed(0)}`,
    }))
      api.diagnostics.register(name, source);
    return [initial(false), debug];
  },
  update(
    state: DeepReadonly<CaromState>,
    api: UpdateApi,
    dt: number,
  ): CaromState {
    let s = {
      ...state,
      simTime: state.simTime + dt,
      muted: api.audio.muted(),
    } as CaromState;
    if (api.input.pressed("mute")) {
      api.audio.setMuted(!s.muted);
      s = { ...s, muted: api.audio.muted() };
    }
    const p1up = api.input.pressed("p1-up"),
      p2up = api.input.pressed("p2-up"),
      p1down = api.input.pressed("p1-down"),
      p2down = api.input.pressed("p2-down");
    const up = p1up || p2up,
      down = p1down || p2down;
    const confirm = api.input.pressed("confirm"),
      back = api.input.pressed("back"),
      pause = api.input.pressed("pause");
    let keyboardConfirmed = false;
    if (
      s.screen === "title" ||
      s.screen === "paused" ||
      s.screen === "matchover"
    ) {
      if (s.screen === "paused" && (back || pause)) {
        s = { ...s, screen: s.resumeScreen };
      } else if (s.screen === "matchover" && back) {
        s = {
          ...initial(s.muted),
          titleIndex: s.titleIndex,
          menuIndex: s.titleIndex,
          simTime: s.simTime,
        };
      } else {
        const count = s.screen === "title" ? 3 : 2;
        const moved = up || down;
        if (up) s = { ...s, menuIndex: (s.menuIndex + count - 1) % count };
        else if (down) s = { ...s, menuIndex: (s.menuIndex + 1) % count };
        if (confirm && !moved) {
          s = transitionMenu(s, s.menuIndex, api);
          keyboardConfirmed = true;
        }
      }
    } else if (s.screen === "howto") {
      if (confirm || back)
        s = {
          ...initial(s.muted),
          titleIndex: s.titleIndex,
          menuIndex: s.titleIndex,
          simTime: s.simTime,
        };
    } else if ((s.screen === "playing" || s.screen === "countdown") && pause) {
      s = { ...s, resumeScreen: s.screen, screen: "paused", menuIndex: 0 };
    }
    const samples = api.input.pointerSamples().filter((p) => p.primary);
    let pointerConfirmed: number | null = null;
    let pointerPress: number | null = null;
    if (["title", "howto", "paused", "matchover"].includes(s.screen)) {
      const p = api.input.pointer();
      const hovers = [
        ...samples.map((q) => ({ x: q.x, y: q.y })),
        { x: p.x, y: p.y },
      ];
      for (const q of hovers)
        for (let i = 0; i < 4; i++) {
          const r = rectFor(s.screen, i);
          if (
            r &&
            q.x >= r.x &&
            q.x <= r.x + r.w &&
            q.y >= r.y &&
            q.y <= r.y + r.h
          )
            s = { ...s, menuIndex: i };
        }
      for (const q of samples) {
        for (let i = 0; i < 4; i++) {
          const r = rectFor(s.screen, i);
          if (
            r &&
            q.x >= r.x &&
            q.x <= r.x + r.w &&
            q.y >= r.y &&
            q.y <= r.y + r.h
          ) {
            if (q.type === "down") pointerPress = i;
            if (q.type === "up" && pointerPress === i) pointerConfirmed = i;
          }
        }
      }
      const pointerDown = api.input.pointerPressed(),
        pointerUp = api.input.pointerReleased();
      if (pointerDown || pointerUp) {
        const r = rectFor(s.screen, s.menuIndex);
        if (
          r &&
          p.x >= r.x &&
          p.x <= r.x + r.w &&
          p.y >= r.y &&
          p.y <= r.y + r.h
        ) {
          if (pointerDown) pointerPress = s.menuIndex;
          if (pointerUp && pointerPress === s.menuIndex)
            pointerConfirmed = s.menuIndex;
        }
      }
      if (pointerConfirmed !== null && !keyboardConfirmed)
        s = transitionMenu(s, pointerConfirmed, api);
    }
    if (s.screen !== "playing" && s.screen !== "countdown") return s;
    const movePaddle = (side: Side): PaddleState => {
      const old = s.paddles[side];
      let vy = 0;
      if (old.driven) vy = old.drivenVy;
      else if (side === "left" || s.mode === "versus")
        vy =
          (api.input.value(side === "left" ? "p1-down" : "p2-down") -
            api.input.value(side === "left" ? "p1-up" : "p2-up")) *
          PADDLE_SPEED;
      else if (s.ai.movement) {
        let target = AI_HOME_Y,
          dead = AI_HOME_DEADZONE;
        if (
          s.ai.tracking &&
          s.screen === "playing" &&
          s.ball &&
          s.ball.vx > 0
        ) {
          target = s.ball.y - s.ball.vy * AI_REACT;
          dead = AI_DEADZONE;
        }
        const diff = target - old.cy;
        vy =
          Math.abs(diff) <= dead
            ? 0
            : Math.sign(diff) *
              Math.min(AI_SPEED, dt > 0 ? Math.abs(diff) / dt : AI_SPEED);
      }
      const cy = clamp(old.cy + vy * dt, PADDLE_MIN_CY, PADDLE_MAX_CY);
      if (dt > 0) vy = (cy - old.cy) / dt;
      return { ...old, cy, vy };
    };
    s = {
      ...s,
      paddles: { left: movePaddle("left"), right: movePaddle("right") },
    };
    let ball = s.ball;
    if (!ball) return s;
    if (s.screen === "countdown" && ball.held) {
      const timer = ball.holdTimer - dt;
      if (timer <= 0) {
        const dir = s.receiver === "left" ? -1 : 1;
        ball = {
          ...ball,
          held: false,
          holdTimer: 0,
          trail: [],
          vx: dir * SERVE_SPEED * Math.cos(SERVE_ANGLE),
          vy: ball.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE),
        };
        s = { ...s, screen: "playing" };
      } else ball = { ...ball, holdTimer: timer };
    } else if (s.screen === "playing" && !ball.held) {
      const speed = Math.hypot(ball.vx, ball.vy),
        n = Math.max(1, Math.ceil((speed * dt) / MAX_SUBSTEP)),
        h = dt / n;
      const cues = new Set<string>();
      for (let i = 0; i < n; i++) {
        const v = Math.hypot(ball.vx, ball.vy);
        if (v > 0) {
          const a = (ball.spin / v) * h,
            c = Math.cos(a),
            si = Math.sin(a),
            vx: number = ball.vx * c - ball.vy * si,
            vy: number = ball.vx * si + ball.vy * c;
          ball = { ...ball, vx, vy };
        }
        ball = {
          ...ball,
          spin: ball.spin * Math.pow(0.5, h / SPIN_HALFLIFE),
          x: ball.x + ball.vx * h,
          y: ball.y + ball.vy * h,
        };
        if (ball.y - BALL_R < 0 && ball.vy < 0) {
          ball = { ...ball, y: BALL_R, vy: -ball.vy };
          cues.add(CUES.wallBounce);
        } else if (ball.y + BALL_R > FIELD_H && ball.vy > 0) {
          ball = { ...ball, y: FIELD_H - BALL_R, vy: -ball.vy };
          cues.add(CUES.wallBounce);
        }
        for (const side of ["left", "right"] as const) {
          const r =
            side === "left"
              ? {
                  x0: P1_X0,
                  x1: P1_X1,
                  y0: s.paddles.left.cy - PADDLE_HALF,
                  y1: s.paddles.left.cy + PADDLE_HALF,
                }
              : {
                  x0: P2_X0,
                  x1: P2_X1,
                  y0: s.paddles.right.cy - PADDLE_HALF,
                  y1: s.paddles.right.cy + PADDLE_HALF,
                };
          const hit = circleRect(ball, r);
          if (hit) {
            ball = hit.ball;
            if (hit.face === "left" || hit.face === "right") {
              const paddle = s.paddles[side],
                offset = clamp((ball.y - paddle.cy) / PADDLE_HALF, -1, 1),
                theta = offset * MAX_BOUNCE_ANGLE,
                speed2 = Math.min(
                  Math.hypot(ball.vx, ball.vy) * SPEED_MULT,
                  SPEED_CAP,
                ),
                dir = side === "left" ? 1 : -1;
              ball = {
                ...ball,
                x: side === "left" ? P1_X1 + BALL_R : P2_X0 - BALL_R,
                vx: dir * speed2 * Math.cos(theta),
                vy: speed2 * Math.sin(theta),
                spin: clamp(
                  ball.spin + paddle.vy * SPIN_FROM_PADDLE,
                  -SPIN_CLAMP,
                  SPIN_CLAMP,
                ),
              };
              cues.add(CUES.paddleHit);
            } else cues.add(CUES.wallBounce);
          }
        }
        for (const obstacle of s.obstacles) {
          const r = OBSTACLES[obstacle.index];
          if (!r) continue;
          const hit = circleRect(ball, r);
          if (hit) {
            ball = hit.ball;
            cues.add(CUES.obstacleBounce);
          }
        }
      }
      for (const cue of cues) api.audio.play(cue);
      if (ball.x - BALL_R > FIELD_W || ball.x + BALL_R < 0) {
        const p1 = ball.x - BALL_R > FIELD_W,
          score = {
            p1: s.score.p1 + (p1 ? 1 : 0),
            p2: s.score.p2 + (p1 ? 0 : 1),
          },
          winner: Side | null =
            score.p1 >= WIN_SCORE && score.p1 - score.p2 >= WIN_LEAD
              ? "left"
              : score.p2 >= WIN_SCORE && score.p2 - score.p1 >= WIN_LEAD
                ? "right"
                : null;
        api.audio.play(CUES.score);
        s = {
          ...s,
          score,
          winner,
          receiver: p1 ? "right" : "left",
          screen: winner ? "matchover" : "countdown",
          menuIndex: 0,
          ball: winner ? ball : makeBall(),
        };
        ball = s.ball;
      }
    }
    if (ball && (s.screen === "playing" || s.screen === "countdown")) {
      const trail = [
        ...ball.trail,
        { x: ball.x, y: ball.y, t: s.simTime },
      ].filter((p) => s.simTime - p.t <= TRAIL_TIME);
      ball = { ...ball, trail };
    }
    return { ...s, ball };
  },
  render(state: DeepReadonly<CaromState>, api: RenderApi): void {
    const c = api.ctx;
    c.fillStyle = BACKGROUND;
    c.fillRect(0, 0, FIELD_W, FIELD_H);
    c.strokeStyle = "#1b3444";
    c.lineWidth = 1;
    for (let x = 80; x < FIELD_W; x += 80) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, FIELD_H);
      c.stroke();
    }
    c.setLineDash([12, 14]);
    c.strokeStyle = "#355062";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(NET_X, 24);
    c.lineTo(NET_X, FIELD_H - 24);
    c.stroke();
    c.setLineDash([]);
    for (const o of state.obstacles) {
      c.fillStyle = COLORS.gold;
      c.shadowColor = COLORS.gold;
      c.shadowBlur = 18;
      c.beginPath();
      c.roundRect(
        o.cx - OBSTACLE_HW,
        o.cy - OBSTACLE_HH,
        OBSTACLE_HW * 2,
        OBSTACLE_HH * 2,
        10,
      );
      c.fill();
    }
    c.shadowBlur = 0;
    const dim =
      state.screen === "title" ||
      state.screen === "howto" ||
      state.screen === "paused" ||
      state.screen === "matchover";
    c.globalAlpha = dim ? 0.3 : 1;
    for (const [side, p] of [
      ["left", state.paddles.left],
      ["right", state.paddles.right],
    ] as const) {
      c.fillStyle = side === "left" ? COLORS.mint : COLORS.coral;
      c.shadowColor = c.fillStyle;
      c.shadowBlur = 20;
      c.beginPath();
      c.roundRect(
        side === "left" ? P1_X0 : P2_X0,
        p.cy - PADDLE_HALF,
        PADDLE_W,
        PADDLE_HALF * 2,
        8,
      );
      c.fill();
    }
    c.shadowBlur = 0;
    const b = state.ball;
    if (b) {
      for (let i = 1; i < b.trail.length; i++) {
        const a = b.trail[i - 1]!,
          q = b.trail[i]!;
        c.strokeStyle = `rgba(82,242,194,${0.12 + (0.6 * i) / b.trail.length})`;
        c.lineWidth = 2 + (5 * i) / b.trail.length;
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(q.x, q.y);
        c.stroke();
      }
      c.fillStyle = COLORS.white;
      c.shadowColor = COLORS.mint;
      c.shadowBlur = 24;
      c.beginPath();
      c.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 0;
    }
    c.globalAlpha = 1;
    if (
      state.screen === "playing" ||
      state.screen === "countdown" ||
      state.screen === "paused" ||
      state.screen === "matchover"
    ) {
      c.fillStyle = COLORS.mint;
      c.font = "700 56px system-ui";
      c.textAlign = "right";
      c.fillText(String(state.score.p1), FIELD_CX - 22, 88);
      c.fillStyle = COLORS.coral;
      c.textAlign = "left";
      c.fillText(String(state.score.p2), FIELD_CX + 22, 88);
      c.textAlign = "center";
      c.fillStyle = COLORS.muted;
      c.font = "600 14px system-ui";
      c.fillText(
        state.mode === "solo" ? "SOLO • VS THE HOUSE" : "VERSUS • LOCAL DUEL",
        FIELD_CX,
        119,
      );
    }
    if (state.screen === "title") {
      c.fillStyle = "rgba(4,12,20,.82)";
      c.fillRect(0, 0, FIELD_W, FIELD_H);
      c.textAlign = "center";
      c.fillStyle = COLORS.mint;
      c.font = "900 104px system-ui";
      c.fillText(TITLE_TEXT, FIELD_CX, 220);
      c.fillStyle = COLORS.text;
      c.font = "500 19px system-ui";
      c.fillText("READ THE ANGLE. OWN THE RALLY.", FIELD_CX, 265);
      drawMenu(c, TITLE_ITEMS, state.menuIndex, 352);
      c.fillStyle = COLORS.muted;
      c.font = "14px system-ui";
      c.fillText(
        "W / S   MOVE   •   ↑ / ↓   SECOND PADDLE   •   ENTER   SELECT   •   P   PAUSE   •   M   SOUND",
        FIELD_CX,
        650,
      );
    } else if (state.screen === "howto") {
      overlay(c, "HOW TO PLAY");
      c.fillStyle = COLORS.text;
      c.textAlign = "center";
      c.font = "19px system-ui";
      c.fillText(
        "Move with W / S. In Versus, player two uses ↑ / ↓.",
        FIELD_CX,
        330,
      );
      c.fillText(
        "Meet the ball near a paddle's edge to change its angle.",
        FIELD_CX,
        376,
      );
      c.fillText(
        "Move into the hit to add spin: your motion bends the flight.",
        FIELD_CX,
        422,
      );
      c.fillText(
        "The gold bars are solid. Bank shots open new lanes.",
        FIELD_CX,
        468,
      );
      drawMenu(c, ["BACK TO TITLE"], 0, 578);
    } else if (state.screen === "paused") {
      overlay(c, "PAUSED");
      drawMenu(c, PAUSE_ITEMS, state.menuIndex, 410);
    } else if (state.screen === "countdown") {
      c.fillStyle = COLORS.white;
      c.font = "700 18px system-ui";
      c.textAlign = "center";
      c.fillText("GET READY", FIELD_CX, FIELD_CY + 76);
    } else if (state.screen === "matchover") {
      overlay(
        c,
        state.winner === "left" ? "PLAYER ONE WINS" : "PLAYER TWO WINS",
      );
      c.fillStyle = COLORS.text;
      c.font = "600 22px system-ui";
      c.textAlign = "center";
      c.fillText(`${state.score.p1}  —  ${state.score.p2}`, FIELD_CX, 350);
      drawMenu(c, MATCHOVER_ITEMS, state.menuIndex, 410);
    }
  },
};
function overlay(c: CanvasRenderingContext2D, title: string) {
  c.fillStyle = "rgba(4,12,20,.84)";
  c.fillRect(0, 0, FIELD_W, FIELD_H);
  c.fillStyle = COLORS.text;
  c.font = "800 48px system-ui";
  c.textAlign = "center";
  c.fillText(title, FIELD_CX, 300);
}
function drawMenu(
  c: CanvasRenderingContext2D,
  items: readonly string[],
  active: number,
  startY: number,
) {
  items.forEach((item, i) => {
    const y = startY + i * 58,
      rect = rectFor(
        items === TITLE_ITEMS
          ? "title"
          : items === PAUSE_ITEMS
            ? "paused"
            : items === MATCHOVER_ITEMS
              ? "matchover"
              : "howto",
        i,
      );
    if (i === active) {
      c.fillStyle = "#163646";
      c.strokeStyle = COLORS.mint;
      c.lineWidth = 2;
      c.beginPath();
      c.roundRect(450, y - 37, 380, 48, 14);
      c.fill();
      c.stroke();
    }
    c.fillStyle = i === active ? COLORS.mint : COLORS.text;
    c.font = `${i === active ? 750 : 550} 19px system-ui`;
    c.textAlign = "center";
    c.fillText(item, FIELD_CX, y - 6);
    void rect;
  });
}
