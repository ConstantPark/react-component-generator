---
name: create-pr
description: Create or update a GitHub pull request through a delegated sub-agent when the user explicitly asks for a PR, selecting an English or Korean reference template from the project's language and community.
metadata:
  short-description: Create a GitHub pull request
---

# Create PR

Create a focused GitHub pull request through a delegated sub-agent. Use this skill only when the user explicitly asks to create, open, or update a PR; reviewing code or committing changes alone does not invoke it.

## Workflow

1. Read the repository's applicable `AGENTS.md` files and inspect `git status`, the current branch, remotes, recent commits, and the default branch.
2. Keep unrelated working-tree changes out of the PR. If the requested work is not committed, ask whether to include it or create the PR from the existing committed state; do not silently discard or stash user changes.
3. Run the narrowest relevant project checks. For this repository, prefer `bun run lint`, `bun run test`, and `bun run build` when source or configuration changes are included. Report failures accurately; do not hide them with `--no-verify` or by changing tests just to make the PR green.
4. Verify the target remote before any delegation. Compare `git remote get-url origin` with `gh repo view --json nameWithOwner,url`; if the repository identity is missing or unexpected, stop and ask the user rather than pushing.
5. Inspect the repository's contributor language before drafting the PR. Check `README*`, `CONTRIBUTING*`, `CODE_OF_CONDUCT*`, `.github/PULL_REQUEST_TEMPLATE*`, `.github/ISSUE_TEMPLATE*`, package metadata, and recent PR titles/bodies when available. Apply this precedence:
   - An explicit language request from the user wins.
   - Use Korean when the repository is clearly a Korean project: its README, contribution guide, issue/PR templates, and maintainer-facing documentation are predominantly Korean.
   - Use English for overseas or global open-source projects: the repository owner/community, README, contribution guide, or existing PR conventions are predominantly English.
   - If the evidence is genuinely mixed, ask the user before delegating. Do not choose only from the language of the current chat.
6. Inspect the diff and commit range for secrets before delegation. Check changed files and `base..HEAD` for `.env` files, private keys, tokens, and API-key-shaped values without printing matching values. Stop and ask the user if a likely secret is found; never rely only on the PR-body redaction rule.
7. Read only the selected reference: `references/pr-body.ko.md` for Korean or `references/pr-body.en.md` for English. Fill it with repository-specific facts and remove unused sections.
8. Prepare a delegation brief containing the verified repository identity, selected template path and language, PR title, head/base branches, commit range, validation results, secret-scan result, scope, known failures, and explicit confirmation that the user requested PR creation.
9. Delegate the GitHub mutation to `multi_agent_v1__spawn_agent` (or the platform's equivalent sub-agent tool) with that brief. The delegated agent must have access to the repository, `git`, and authenticated `gh`, and must re-check the remote, branch, and existing PRs before mutation. The parent agent must not run PR mutation commands itself.
10. The sub-agent must query open PRs for the exact head branch and base. If one matching PR exists, update it; if multiple candidates exist, stop and return them for user choice; if none exists, push the head branch when necessary and create one.
11. The sub-agent must never force-push, rewrite history, expose credentials, or create a duplicate PR. If GitHub rejects the operation, it must stop and return the exact blocker.
12. Return the sub-agent's PR URL, verified repository, head/base branches, commit range, checks run, selected language/template, and any known failures. If delegation is unavailable, stop and explain that the PR cannot be created under this skill's execution boundary.

## Project constraints

- This repository uses Bun. Do not use npm, yarn, or pnpm for checks or dependency changes.
- API keys and `.env` contents must never appear in the PR title, body, command output, or logs. Mention configuration only as a presence/absence fact.
- Preserve the generated component execution boundary and the existing Vite `/api` proxy unless the PR explicitly changes them.
- Keep one logical purpose per PR. Do not fold unrelated documentation, formatting, or generated artifacts into the change.

## Delegation boundary

The parent agent owns repository inspection, scope decisions, language classification, secret scanning, validation, and the delegation brief. A sub-agent spawned through `multi_agent_v1__spawn_agent` (or the platform equivalent) owns all GitHub mutations related to the PR, including pushing the head branch and running `gh pr create` or `gh pr edit`. The parent agent reviews the sub-agent's result and reports it; it does not repeat the mutation.

## Template routing

The templates are deliberately separate so reviewers can receive a natural, consistent description in the requested language:

- Korean: [references/pr-body.ko.md](references/pr-body.ko.md)
- English: [references/pr-body.en.md](references/pr-body.en.md)

Use the selected file as the structure, not as text to quote verbatim when a section is not applicable. Replace every placeholder and remove empty sections before submitting.
