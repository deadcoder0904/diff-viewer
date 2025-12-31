export function calculateLcsLength(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;

  const left = b.length < a.length ? b : a;
  const right = b.length < a.length ? a : b;

  const dp = Array.from({ length: left.length + 1 }, () => 0);

  for (let i = 1; i <= right.length; i += 1) {
    let prev = 0;
    for (let j = 1; j <= left.length; j += 1) {
      const temp = dp[j];
      if (right[i - 1] === left[j - 1]) {
        dp[j] = prev + 1;
      } else {
        dp[j] = Math.max(dp[j], dp[j - 1]);
      }
      prev = temp;
    }
  }

  return dp[left.length];
}

export interface DiffStats {
  added: number;
  removed: number;
}

export function calculateDiffStats(originalText: string, changedText: string): DiffStats {
  const originalLines = originalText ? originalText.split(/\r?\n/) : [];
  const changedLines = changedText ? changedText.split(/\r?\n/) : [];

  if (originalLines.length === 0 && changedLines.length === 0) {
    return { added: 0, removed: 0 };
  }

  const common = calculateLcsLength(originalLines, changedLines);
  const removed = originalLines.length - common;
  const added = changedLines.length - common;

  return { added, removed };
}
