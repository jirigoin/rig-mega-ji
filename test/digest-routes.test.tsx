import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

// runs/ is read-only (AGENTS.md): every route test reads a temp copy.
let runsDir: string;
const app = () =>
  createApp({ adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir });

beforeAll(() => {
  runsDir = mkdtempSync(join(tmpdir(), 'rig-runs-'));
  copyFileSync('runs/2026-10-28.jsonl', join(runsDir, '2026-10-28.jsonl'));
  writeFileSync(join(runsDir, '2026-11-01.jsonl'), '');
  writeFileSync(
    join(runsDir, '2026-11-02.jsonl'),
    '{"at":"2026-11-02T01:00:00+01:00","job":"a/one","status":"ok","owner":null}\nnot json\n',
  );
});
afterAll(() => rmSync(runsDir, { recursive: true, force: true }));

describe('GET /digest/:night', () => {
  it('200: one table, sorted by job, retries ≥ 3 and fails marked', async () => {
    const res = await app().request('/digest/2026-10-28');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html.match(/<table>/g)).toHaveLength(1);
    const jobs = [...html.matchAll(/<tr[^>]*><td>([^<]+)<\/td>/g)].map((m) => m[1]);
    expect(jobs).toEqual(['digest/render', 'fixtures/refresh', 'lane/sync', 'notes/backup', 'rig/rotate-logs']);
    expect(html).toContain('<tr class="warn"><td>fixtures/refresh</td>');
    expect(html).toContain('<tr class="warn"><td>notes/backup</td>');
    expect(html).toContain('<tr><td>lane/sync</td>');
    expect(html).toContain('<td>—</td>');
    expect(html).toContain('1 unreadable line');
  });

  it('404 for a night with no file', async () => {
    expect((await app().request('/digest/2026-01-01')).status).toBe(404);
  });

  it('renders "nothing ran" for an empty file', async () => {
    const res = await app().request('/digest/2026-11-01');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('nothing ran');
  });

  it('still renders a night with a bad line', async () => {
    const res = await app().request('/digest/2026-11-02');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('a/one');
    expect(html).toContain('1 unreadable line');
  });
});

describe('GET /api/digest/:night', () => {
  it('200: same jobs, same order as the page', async () => {
    const res = await app().request('/api/digest/2026-10-28');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { rows: { job: string }[]; badLines: number };
    const html = await (await app().request('/digest/2026-10-28')).text();
    const pageJobs = [...html.matchAll(/<tr[^>]*><td>([^<]+)<\/td>/g)].map((m) => m[1]);
    expect(body.rows.map((r) => r.job)).toEqual(pageJobs);
    expect(body.badLines).toBe(1);
  });

  it('404 for a night with no file', async () => {
    expect((await app().request('/api/digest/2026-01-01')).status).toBe(404);
  });

  it('empty night: no rows', async () => {
    const body = (await (await app().request('/api/digest/2026-11-01')).json()) as { rows: unknown[] };
    expect(body.rows).toEqual([]);
  });

  it('night with a bad line: counted, row kept', async () => {
    const body = (await (await app().request('/api/digest/2026-11-02')).json()) as {
      rows: { job: string; owner: string | null }[];
      badLines: number;
    };
    expect(body.rows).toEqual([expect.objectContaining({ job: 'a/one', owner: null })]);
    expect(body.badLines).toBe(1);
  });
});

describe('status board', () => {
  it('links each night on disk to its digest, with counts', async () => {
    const html = await (await app().request('/')).text();
    expect(html).toContain('<a href="/digest/2026-10-28">2026-10-28</a>');
    expect(html).toContain('ok 10 · retry 4 · fail 1');
  });
});
