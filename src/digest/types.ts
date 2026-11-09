// Plan morning-digest § 1. Everything in § 2 builds against these types only.

export type RunStatus = 'ok' | 'retry' | 'fail';

// One line of runs/<night>.jsonl, after parsing.
export type RunLine = {
  at: string; // ISO 8601 with the log's own offset; never converted
  job: string;
  status: RunStatus;
  owner: string | null;
  error?: string;
};

// One row per job for the night.
export type DigestRow = {
  job: string;
  owner: string | null; // owner on the job's last line; null renders as "—"
  runs: number; // lines for this job
  retries: number; // lines with status "retry"
  fails: number; // lines with status "fail"
  lastStatus: RunStatus;
  lastError: string | null; // error of the most recent line that had one
  firstAt: string;
  lastAt: string;
};

export type DigestCounts = Record<RunStatus, number>;

export type Night = {
  night: string; // YYYY-MM-DD
  rows: DigestRow[]; // sorted by job
  counts: DigestCounts; // lines per status
  badLines: number; // lines that did not parse; counted, never thrown
};

// Returns null when runs/<night>.jsonl does not exist (or night is not YYYY-MM-DD).
export type ReadNight = (runsDir: string, night: string) => Night | null;
