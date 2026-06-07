# Agent Instructions for ChallengeHub.de

## Project Intent

Rebuild `https://challengehub.de/` as a Next.js project in this folder.

Primary GitHub repository:

- `https://github.com/powaaah/challengehub`
- SSH form, if available: `git@github.com:powaaah/challengehub.git`

The target production server is the existing VPS documented in the neighboring
`Server Administration` workspace. Before making deployment changes, read the
current server notes there, especially `informationen.MD`, `TODOS.MD`, and the
latest entries in `LOG.MD`.

## Working Language

Speak German with Stefan unless he asks otherwise.

## Operating Rules

- Maintain a project todo list in `TODOS.md`.
- Maintain a project work log in `LOG.md`.
- At the start of each session, read `AGENTS.md`, `TODOS.md` if present, and
  the latest entries in `LOG.md` if present.
- During work, update `TODOS.md` as tasks become clear, start, finish, or become
  blocked.
- At the end of each meaningful work session, append a concise `LOG.md` entry
  with the date, goal, changes made, verification run, open risks, and next
  suggested step.
- Work in small, reviewable vertical slices.
- Before larger code changes, create a short plan and wait for confirmation if
  the scope is unclear or risky.
- Prefer the existing project patterns once the Next.js app exists.
- Do not introduce broad abstractions, UI libraries, analytics, tracking, auth,
  payments, databases, or deployment changes unless the current slice clearly
  requires them.
- Keep implementation, verification, and recap close together.
- Do not write secrets, API keys, passwords, tokens, or private server details
  into committed files, chat output, logs, or screenshots.
- Use `.env.local` for local-only variables and make sure env files stay ignored.

## Git and GitHub Workflow

- Use Git from the start.
- If this folder is not yet a Git repository, initialize it and connect it to:
  `https://github.com/powaaah/challengehub`.
- Before editing, check:
  - `git status`
  - current branch
  - configured remote
- Never overwrite or revert user changes without explicit permission.
- Keep commits small and logical.
- Use clear commit messages, for example:
  - `chore: scaffold next app`
  - `feat: add homepage hero`
  - `feat: add challenge listing`
  - `fix: adjust mobile navigation`
- Before each commit, run relevant checks and inspect:
  - `git diff`
  - `npm run lint` if available
  - `npm run build` before deployment-related work
- Do not force-push unless Stefan explicitly asks for it.

## Recommended Next.js Setup

Use current stable Next.js conventions unless the repository already defines a
different stack.

Recommended defaults:

- TypeScript
- App Router
- ESLint
- CSS Modules, Tailwind, or existing local styling approach. Choose one and keep
  it consistent; do not add multiple styling systems.
- Production build via `npm run build`
- Production start via `npm run start` or a Docker/systemd process, depending on
  the final deployment decision.

## Website Reconstruction Notes

- Rebuild the actual usable site, not a marketing placeholder.
- Use responsive layouts from the first slice.
- Preserve or intentionally improve the user-facing structure of the existing
  site.
- When copying public website content, verify text and media usage. Do not assume
  scraped content is final unless Stefan approves it.
- Avoid generic placeholder sections. If content is unknown, mark it clearly as
  temporary in code/data, not in the visible UI unless needed.

## Deployment Context

Known server state from the Server Administration workspace:

- VPS: `164.68.108.250`
- Reverse proxy: Caddy in `/home/stefan/stack`
- Caddy currently owns ports `80` and `443`
- Node/npm are installed on the VPS
- Existing project root on VPS: `/home/stefan/projects`
- `challengehub.de` DNS may need to point to the VPS before production cutover
- Caddy needs a route for `challengehub.de` and `www.challengehub.de` before the
  Next.js app can serve the live domain

Do not perform production deployment, DNS cutover, Caddy changes, or service
restarts without Stefan's explicit approval.

## Verification Expectations

For every meaningful slice, run the strongest available verification:

- typecheck, lint, tests, and build when configured
- browser smoke test for changed pages
- mobile and desktop layout checks for UI changes

After implementation, report:

- files changed
- behavior added or changed
- verification run and results
- known risks or remaining work
- what was intentionally not changed

Also update:

- `TODOS.md` with completed, active, and next tasks
- `LOG.md` with a short session entry
