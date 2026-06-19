/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Harbor Recommendation Engine — the "brain".
 *
 * Everything that decides WHAT the user should do next lives here so the rest
 * of the app stays dumb. Given a Task + the user's current HarborContext we
 * produce a "Harbor Fit Score" (0-100) and a friendly reason explaining why.
 *
 * Design goals:
 *  - Never feel punitive. Overdue nudges priority up, it does not shame.
 *  - Respect energy. A low-energy human should never be handed deep work.
 *  - Respect time. Don't surface a 2 hour task to someone with 5 minutes.
 *  - Survival mode = one tiny next step, never a whole project.
 */

import {
  Task,
  HarborContext,
  Recommendation,
  EnergyLevel,
  Mode,
  TaskCategory,
} from '../types';

// ---- Small ordered scales so we can compare levels numerically ----
const ENERGY_RANK: Record<EnergyLevel, number> = { low: 1, medium: 2, high: 3 };
const FRICTION_RANK: Record<'easy' | 'medium' | 'hard', number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

// Map each "mode" to the task categories it favours. Used as a soft bonus.
const MODE_CATEGORIES: Record<Mode, TaskCategory[]> = {
  focus: ['work', 'creative', 'planning'],
  tidy: ['cleaning', 'personal'],
  errands: ['errand'],
  admin: ['admin', 'finance', 'planning'],
  creative: ['creative'],
  // Survival favours gentle, low-stakes self-care + tiny chores.
  survival: ['personal', 'health', 'cleaning'],
};

/** Is a task currently overdue? (has a deadline in the past, not completed) */
export function isOverdue(task: Task): boolean {
  if (!task.deadline) return task.urgency === 'overdue';
  return new Date(task.deadline).getTime() < Date.now();
}

/** A task is "available" for recommendation if it isn't done, dumped, or sleeping. */
export function isAvailable(task: Task): boolean {
  if (task.status === 'completed' || task.status === 'dumped') return false;
  if (task.status === 'snoozed' && task.snoozedUntil) {
    return new Date(task.snoozedUntil).getTime() <= Date.now();
  }
  return true;
}

/**
 * Score a single task against the user's current context.
 * Returns { score (0-100), reason }.
 */
export function scoreTask(
  task: Task,
  ctx: HarborContext,
): { score: number; reason: string } {
  let score = 50; // neutral starting point
  const reasons: string[] = [];

  // --- 1. ENERGY MATCH -----------------------------------------------------
  // Tasks that need MORE energy than the user has are heavily penalised.
  // Tasks that need the same or less feel achievable.
  const energyGap = ENERGY_RANK[task.energyRequired] - ENERGY_RANK[ctx.energy];
  if (energyGap <= 0) {
    score += 18;
    if (task.energyRequired === ctx.energy) reasons.push('matches your energy');
    else reasons.push('gentle on your energy');
  } else if (energyGap === 1) {
    score -= 14;
  } else {
    score -= 28; // e.g. high-energy task while user is low
  }

  // --- 2. TIME FIT ---------------------------------------------------------
  // Penalise tasks that don't fit in the time the user actually has.
  if (task.estimatedMinutes <= ctx.availableMinutes) {
    score += 14;
    reasons.push(`fits your ${ctx.availableMinutes} min`);
  } else {
    const over = task.estimatedMinutes - ctx.availableMinutes;
    score -= Math.min(30, 10 + over / 5);
  }

  // --- 3. LOCATION MATCH ---------------------------------------------------
  // "anywhere" tasks always fit. Otherwise reward an exact location match and
  // softly penalise tasks anchored to a place the user isn't at.
  if (task.location === 'anywhere' || ctx.location === 'anywhere') {
    score += 4;
  } else if (task.location === ctx.location) {
    score += 16;
    reasons.push(`you're set up for this here`);
  } else {
    score -= 18; // can't really do a "home" task while at "work"
  }

  // --- 4. MODE MATCH -------------------------------------------------------
  if (MODE_CATEGORIES[ctx.mode].includes(task.category)) {
    score += 12;
    reasons.push(`on theme for ${ctx.mode} mode`);
  }

  // --- 5. URGENCY ----------------------------------------------------------
  // Overdue lifts priority but stays gentle (a nudge, not a punishment).
  if (isOverdue(task)) {
    score += 16;
    reasons.push('overdue — worth clearing');
  } else if (task.urgency === 'today') {
    score += 12;
    reasons.push('due today');
  } else if (task.urgency === 'this-week') {
    score += 5;
  }

  // --- 6. IMPORTANCE -------------------------------------------------------
  if (task.importance === 'high') score += 10;
  else if (task.importance === 'low') score -= 4;

  // --- 7. FRICTION ---------------------------------------------------------
  // Low energy or quick-win mood ⇒ favour low-friction starts.
  const lowEnergyContext = ctx.energy === 'low' || ctx.mode === 'survival';
  if (lowEnergyContext) {
    score -= (FRICTION_RANK[task.friction] - 1) * 12;
    if (task.friction === 'easy') reasons.push('easy to start');
  } else {
    score -= (FRICTION_RANK[task.friction] - 1) * 4;
  }

  // --- 8. EMOTIONAL WEIGHT -------------------------------------------------
  // Overwhelming tasks are a bad idea when depleted; rewarding ones lift mood.
  if (task.emotionalWeight === 'overwhelming') {
    score -= lowEnergyContext ? 24 : 8;
  } else if (task.emotionalWeight === 'rewarding') {
    score += 8;
    reasons.push('feels good to finish');
  } else if (task.emotionalWeight === 'annoying' && lowEnergyContext) {
    score -= 6;
  }

  // --- 9. QUICK WIN PREFERENCE --------------------------------------------
  if (ctx.preference === 'quick-win') {
    if (task.isQuickWin) {
      score += 16;
      reasons.push('quick win');
    } else if (task.estimatedMinutes > 30) {
      score -= 12;
    }
  } else {
    // "meaningful progress" ⇒ reward important, deeper work
    if (task.importance === 'high' && task.estimatedMinutes >= 30) {
      score += 10;
      reasons.push('real progress');
    }
  }

  // --- 10. DEADLINE PROXIMITY ---------------------------------------------
  if (task.deadline && !isOverdue(task)) {
    const days =
      (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (days <= 1) score += 8;
    else if (days <= 3) score += 4;
  }

  // Clamp to 0-100 and craft a readable reason.
  score = Math.max(0, Math.min(100, Math.round(score)));
  const reason = buildReason(reasons);
  return { score, reason };
}

function buildReason(reasons: string[]): string {
  if (reasons.length === 0) return 'A reasonable next move.';
  const top = reasons.slice(0, 2);
  const text = top.join(' and ');
  return text.charAt(0).toUpperCase() + text.slice(1) + '.';
}

/**
 * Produce the three headline recommendations used in the "What Should I Do
 * Now?" results and the dashboard:
 *   - Best Bet:            highest overall fit
 *   - Easy Win:            best low-friction / quick task
 *   - Future You Will...:  the important thing we tend to avoid
 *
 * Survival mode short-circuits to a single tiny next step.
 */
export function getRecommendations(
  tasks: Task[],
  ctx: HarborContext,
): Recommendation[] {
  const pool = tasks.filter(isAvailable);
  if (pool.length === 0) return [];

  const scored: Recommendation[] = pool.map((task) => {
    const { score, reason } = scoreTask(task, ctx);
    return { task, score, reason };
  });

  // Survival mode: just one gentle, tiny, low-friction step.
  if (ctx.mode === 'survival') {
    const tiny = [...scored]
      .filter((r) => r.task.estimatedMinutes <= 15)
      .sort(
        (a, b) =>
          FRICTION_RANK[a.task.friction] - FRICTION_RANK[b.task.friction] ||
          a.task.estimatedMinutes - b.task.estimatedMinutes ||
          b.score - a.score,
      );
    const pick = tiny[0] || [...scored].sort((a, b) => b.score - a.score)[0];
    return [{ ...pick, slot: 'best-bet', reason: 'One tiny step. That is all.' }];
  }

  const byScore = [...scored].sort((a, b) => b.score - a.score);
  const used = new Set<string>();
  const out: Recommendation[] = [];

  // Best Bet — the top overall fit.
  const bestBet = byScore[0];
  if (bestBet) {
    out.push({ ...bestBet, slot: 'best-bet' });
    used.add(bestBet.task.id);
  }

  // Easy Win — best quick-win / low-friction / short task not already used.
  const easyWin = [...scored]
    .filter((r) => !used.has(r.task.id))
    .filter(
      (r) =>
        r.task.isQuickWin ||
        r.task.friction === 'easy' ||
        r.task.estimatedMinutes <= 15,
    )
    .sort(
      (a, b) =>
        a.task.estimatedMinutes - b.task.estimatedMinutes || b.score - a.score,
    )[0];
  if (easyWin) {
    out.push({
      ...easyWin,
      slot: 'easy-win',
      reason: easyWin.task.isQuickWin
        ? 'A quick win to build momentum.'
        : 'Low effort, fast to clear.',
    });
    used.add(easyWin.task.id);
  }

  // Future You Will Thank You — important things we keep avoiding.
  const futureYou = [...scored]
    .filter((r) => !used.has(r.task.id))
    .filter(
      (r) =>
        r.task.importance === 'high' ||
        isOverdue(r.task) ||
        r.task.emotionalWeight === 'overwhelming' ||
        r.task.emotionalWeight === 'annoying',
    )
    .sort((a, b) => avoidanceWeight(b) - avoidanceWeight(a))[0];
  if (futureYou) {
    out.push({
      ...futureYou,
      slot: 'future-you',
      reason: 'The thing that keeps getting pushed. Worth it.',
    });
    used.add(futureYou.task.id);
  }

  // Backfill if we couldn't find distinct picks.
  for (const r of byScore) {
    if (out.length >= 3) break;
    if (!used.has(r.task.id)) {
      const slot =
        out.length === 1 ? 'easy-win' : out.length === 2 ? 'future-you' : 'best-bet';
      out.push({ ...r, slot });
      used.add(r.task.id);
    }
  }

  return out.slice(0, 3);
}

// How "avoided + important" a task is — used to rank Future You picks.
function avoidanceWeight(r: Recommendation): number {
  const t = r.task;
  let w = 0;
  if (t.importance === 'high') w += 3;
  if (isOverdue(t)) w += 3;
  if (t.emotionalWeight === 'overwhelming') w += 2;
  if (t.emotionalWeight === 'annoying') w += 1;
  // Older tasks have been avoided longer.
  const ageDays =
    (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  w += Math.min(3, ageDays / 7);
  return w;
}

/**
 * Default dashboard context derived from the Entrance "sky" state so the home
 * screen can show a sensible Best Bet before the user runs the full flow.
 */
export function contextFromSky(sky: string): HarborContext {
  const map: Record<string, Partial<HarborContext>> = {
    clear: { energy: 'high', mode: 'focus', preference: 'progress' },
    foggy: { energy: 'low', mode: 'tidy', preference: 'quick-win' },
    wired: { energy: 'high', mode: 'creative', preference: 'progress' },
    tired: { energy: 'low', mode: 'survival', preference: 'quick-win' },
    avoiding: { energy: 'medium', mode: 'admin', preference: 'quick-win' },
    overstimulated: { energy: 'low', mode: 'survival', preference: 'quick-win' },
  };
  return {
    availableMinutes: 30,
    energy: 'medium',
    location: 'anywhere',
    mode: 'focus',
    preference: 'progress',
    ...(map[sky] || {}),
  };
}

/** Suggested ways to shrink an overwhelming task into a doable next move. */
export function shrinkSuggestions(task: Task): string[] {
  return [
    `One tiny step: open whatever you need for "${task.title}".`,
    `One 10-minute action: set a timer and just begin "${task.title}".`,
    `One question to answer: what is the very first decision "${task.title}" needs?`,
    `One thing to gather: collect anything you'll need for "${task.title}".`,
  ];
}
