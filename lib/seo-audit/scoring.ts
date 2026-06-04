/** Graduated 0–100 scores (avoids harsh all-or-nothing checks). */

export function lengthBandScore(
  length: number,
  idealMin: number,
  idealMax: number,
): number {
  if (length === 0) {
    return 0;
  }
  if (length >= idealMin && length <= idealMax) {
    return 100;
  }
  if (length < idealMin) {
    return Math.round((length / idealMin) * 85);
  }
  const over = length - idealMax;
  return Math.max(45, 100 - Math.round(over * 1.2));
}

export function presenceScore(present: boolean, partial = 50): number {
  return present ? 100 : partial;
}

/** Fraction of required items present (0–1). */
export function fractionScore(present: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((present / total) * 100);
}

export function h1CountScore(count: number): number {
  if (count === 1) {
    return 100;
  }
  if (count === 0) {
    return 35;
  }
  if (count === 2) {
    return 78;
  }
  return Math.max(25, 90 - (count - 1) * 12);
}

export function headingOrderScore(levels: number[]): number {
  if (levels.length <= 1) {
    return 100;
  }

  let validTransitions = 0;
  let previous = levels[0];

  for (let index = 1; index < levels.length; index++) {
    const current = levels[index];
    if (current <= previous + 1) {
      validTransitions += 1;
    }
    previous = current;
  }

  return Math.round((validTransitions / (levels.length - 1)) * 100);
}

export function semanticTagsScore(tagCount: number, target = 3): number {
  return Math.min(100, Math.round((tagCount / target) * 100));
}

export function passedAt(score: number, threshold: number): boolean {
  return score >= threshold;
}
