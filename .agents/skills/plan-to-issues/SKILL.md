---
name: plan-to-issues
description: Split this repo's plan.md into GitHub issues with gh, one per unit of work, after a human has reviewed the split. Use when a plan is ready and has no issues yet.
---

# plan-to-issues

Turns `plan.md` into GitHub issues that workers can pick up cold. Easiest with `gh`, authenticated,
in a shell this agent can run.

## Steps

1. Read `plan.md`, `AGENTS.md` and `docs/adr/`.
2. Draft the split as a table: title · plan section · scope · done when · blocked by.
   One issue per unit of work.
3. **Stop and show the table to the human.** Publish nothing until they approve it.
4. Every issue carries what "What every issue carries" below says. Ask the human only about
   anything this plan needs beyond it.
5. Create each issue in dependency order, so blocked-by can cite real numbers:

   ```sh
   gh issue create --title "<title>" --body-file <tmp.md>
   ```

6. Record every issue URL from gh's output (not from memory) and reply with the list.

Closing one, with the closing comment from AGENTS.md:

```sh
gh issue close <n> -c "<closing comment>"
```

## What every issue carries

Approved by the repo owner on 2026-11-09 (plan morning-digest). This is the issue shape here.

- **Label:** `plan:<plan name>`, from `plan:` in the plan's frontmatter (e.g. `plan:morning-digest`).
- **Body, in this order:**

  ```md
  Source: plan.md § <n>

  ## Scope

  <what this issue changes, in the plan's own terms>

  ## Done when

  <the plan's "Done when" for this section, checkable by someone else>

  ## Blocked by

  <#n, #m — or "—">
  ```

- The first line is exactly `Source: plan.md § <n>` (`<n>` as the plan numbers it: `1`, `2a`).
  The reviewer sorts issues by it.
- A section that must land before others can start gets its own issue (e.g. § 1's types file).
- **Waiting on someone else:** when "Done when" needs another person to act (a reviewer looks,
  someone confirms), the issue stays open until they do: sending is not done. Anything that
  must wait for it (a clean-up, a marker taken off) lists it under "Blocked by".

## No `gh`

Steps 1–4 hold either way. GitHub reachable another way (a connector, the REST API, the web UI):
the same issues, made that way. GitHub issues out of reach altogether: write them as files in
`docs/issues/`, format in ADR 0004, then commit and push.

## Don'ts

- Don't paste the whole plan into one issue, and don't keep issues only in chat.
- Don't invent sections the plan doesn't have. If the plan is unclear, ask.
