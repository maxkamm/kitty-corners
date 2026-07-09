# Contributing & Repository Guide

This document describes where the project lives, how the repository is organized,
and the rules for branching and commits. Read it before pushing your first change.

## Repository

- **Host:** GitHub — https://github.com/maxkamm/kitty-corners
- **Owner:** `maxkamm`
- **Visibility:** Public
- **Default branch:** `main`

### Clone (SSH)

Access is over SSH. Make sure your SSH key is added to your GitHub account
(`ssh -T git@github.com` should greet you by username), then:

```bash
git clone git@github.com:maxkamm/kitty-corners.git
cd kitty-corners
```

The game itself lives in `game/` (Svelte 4 + TypeScript + Vite). See
[README.md](README.md) for build and run instructions.

## Branch model — GitFlow

| Branch        | Purpose                                                        | Base      | Merges into        |
| ------------- | ------------------------------------------------------------- | --------- | ------------------ |
| `main`        | Production / released code. Every commit is a shippable state. | —         | —                  |
| `develop`     | Integration branch. Latest delivered development changes.      | `main`    | `main` (via release) |
| `feature/*`   | New features and non-urgent fixes.                             | `develop` | `develop`          |
| `release/*`   | Release stabilization (version bump, final QA).                | `develop` | `main` **and** `develop` |
| `hotfix/*`    | Urgent production fixes.                                        | `main`    | `main` **and** `develop` |

Use short, descriptive branch names: `feature/playgama-bridge-integration`,
`hotfix/victory-screen-crash`.

## Protected branches

`main` and `develop` are protected by the **"Protected branches (GitFlow)"**
ruleset. On these branches:

- Changes must arrive through a **Pull Request** — no direct pushes.
- **Force pushes are blocked.**
- **Branch deletion is blocked.**
- Required approvals: **0** (solo project — you can merge your own PR).

Because direct pushes to `main`/`develop` are rejected, always work on a
`feature/*`, `release/*`, or `hotfix/*` branch and open a PR.

## Everyday workflow

Start a feature from an up-to-date `develop`:

```bash
git checkout develop
git pull
git checkout -b feature/my-thing
```

Commit as you go, then push and open a PR into `develop`:

```bash
git push -u origin feature/my-thing
# open a PR feature/my-thing -> develop on GitHub, then merge it
```

For a release, branch `release/x.y.z` from `develop`, finalize, then open PRs
into both `main` and `develop`, and tag the release on `main`:

```bash
git tag -a v1.0.0 -m "Kitty Corners 1.0.0"
git push origin v1.0.0
```

## Commit conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>

<optional body>
```

Common types:

- `feat` — a new feature
- `fix` — a bug fix
- `docs` — documentation only
- `refactor` — code change that neither fixes a bug nor adds a feature
- `test` — adding or fixing tests
- `chore` — build process, tooling, dependencies
- `wip` — work-in-progress checkpoint on a feature branch (never merged as-is)

Guidelines:

- Write the summary in the imperative mood: "add rewarded ad adapter", not "added".
- Keep the summary under ~72 characters; put detail in the body.
- One logical change per commit where practical.

Examples:

```
feat(ads): wire Playgama Bridge interstitial + rewarded adapters
fix(board): prevent cat placement on given cells
docs: add repository and contribution guide
```

## Before opening a PR

From `game/`, make sure the project is healthy:

```bash
cd game
npm install
npm run check    # svelte-check (types + a11y)
npm test         # solver + game.ts unit tests
npm run build    # production bundle
```
