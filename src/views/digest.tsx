import type { DigestRow, Night } from '../digest/types.js';

// Plan morning-digest § 2a. Marked: 3 or more retries, or any fail.
export function isMarked(row: DigestRow): boolean {
  return row.retries >= 3 || row.fails > 0;
}

const dash = (v: string | null) => v ?? '—';

export function DigestPage({ night }: { night: Night }) {
  return (
    <>
      <h1>digest · {night.night}</h1>
      <p class="mute">
        ok {night.counts.ok} · retry {night.counts.retry} · fail {night.counts.fail}
        {night.badLines > 0 ? ` · ${night.badLines} unreadable line${night.badLines === 1 ? '' : 's'}` : ''}
      </p>
      {night.rows.length === 0 ? (
        <p>nothing ran</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>job</th>
              <th>owner</th>
              <th>runs</th>
              <th>retries</th>
              <th>last status</th>
              <th>last error</th>
              <th>first</th>
              <th>last</th>
            </tr>
          </thead>
          <tbody>
            {night.rows.map((r) => (
              <tr class={isMarked(r) ? 'warn' : undefined}>
                <td>{r.job}</td>
                <td>{dash(r.owner)}</td>
                <td>{r.runs}</td>
                <td>{r.retries}</td>
                <td>{r.lastStatus}</td>
                <td>{dash(r.lastError)}</td>
                <td>{r.firstAt}</td>
                <td>{r.lastAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
