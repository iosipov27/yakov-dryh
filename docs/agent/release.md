# Release Workflow

Use this file when the user asks to prepare, publish, draft, validate, or
explain a release for this Foundry system.

The default release process is automated and uses:

- git commits and tags for version history
- GitHub CLI (`gh`) from WSL for release creation and release notes
- the repository GitHub Actions release workflow for packaged release assets

Do not switch the install URLs away from GitHub Release assets unless the user
explicitly asks for that behavior.

## Trigger Phrases

Treat short user requests like `сделай релиз`, `prepare release`, `run release`,
or `release` as a request to run this full automated workflow immediately.

Do not ask the user to paste a longer release command. Do not stop at a plan
unless the user explicitly asks for a dry run, checklist, or explanation only.

## Release Goal

When the user asks for a release, complete the whole release flow unless they
explicitly ask for a dry run or planning only.

The expected automated result is:

1. Analyze commits since the last release tag.
2. Suggest the next semver version.
3. Update release versions in project files.
4. Generate release notes from recent changes.
5. Commit the release bump.
6. Push `main`.
7. Create and push the release tag.
8. Create or update the GitHub release as a draft by default.
9. Return the version, tag, release URL, manifest URL, download URL,
   compatibility, and release notes.

If a step cannot be completed because authentication, permissions, CI, or network
access is missing, stop at the failed step and explain exactly what is needed.

## Release Assets

- Release workflow file: `.github/workflows/release.yml`
- Trigger: pushing a git tag matching `v*`, for example `v0.1.0`
- Manual fallback: run the same workflow from GitHub Actions with
  `workflow_dispatch` and provide an existing tag
- Release assets produced by the workflow:
  - `system.json`
  - `yakov-dryh.zip`

The workflow already builds the package, verifies the tag matches
`system.json`, packages the release assets, and publishes them to the GitHub
release.

## Release URL Rules

- Keep `system.json` `manifest` pointed at:
  - `https://github.com/iosipov27/yakov-dryh/releases/latest/download/system.json`
- Keep `system.json` `download` pointed at:
  - `https://github.com/iosipov27/yakov-dryh/releases/latest/download/yakov-dryh.zip`
- Do not switch release installs back to branch archives or tag source archives
  unless the user explicitly asks for that behavior.
- Treat GitHub Release assets as the installable artifact source.
- Local build output in `scripts/` can be ignored by Git as long as the release
  workflow rebuilds it before packaging.

## Automated Release Checklist

Follow this checklist in order.

1. Confirm the working tree:
   `git status --short --branch`.
   Note any uncommitted user changes. Do not overwrite or revert them. If they
   would ship in the release, say so clearly.
2. Confirm GitHub CLI is available and authenticated:
   `command -v gh` and `gh auth status`.
   If `gh` is missing or not authenticated, stop and ask the user to install or
   log in with `gh auth login`.
3. Fetch current remote state:
   `git fetch --tags --prune origin`.
   If SSH fetch fails, use the HTTPS remote checks from "Git Push Notes" without
   changing `origin`.
4. Confirm the release branch:
   `git status --short --branch` and `git rev-parse --abbrev-ref HEAD`.
   The normal release branch is `main`. Do not release from another branch unless
   the user explicitly asks.
5. Find the latest release tag:
   `git tag --list 'v*' --sort=-v:refname | head`.
6. Analyze commits and files changed since the latest tag:
   `git log --date=short --format='%h %ad %s' <last-tag>..HEAD`
   and `git diff --name-status <last-tag>..HEAD`.
   If there are no commits since the latest tag, stop unless the user explicitly
   asks to reissue the release.
7. Suggest the next semver version:
   - patch for fixes, docs, styles, build changes, and small behavior changes
   - minor for new user-visible features, new sheets, new gameplay flows, or
     meaningful Foundry behavior changes
   - major only for explicit breaking changes, manifest compatibility breaks, or
     migration-heavy schema changes
   For pre-`1.0.0` releases, prefer `0.x.y` patch/minor bumps unless the user
   explicitly asks for `1.0.0`.
8. Generate release notes before editing versions. Use commits and changed files
   since the latest tag as the source of truth. Do not invent changes.
9. Update versions:
   - `system.json` `version`
   - `package.json` `version`
   - `package-lock.json` root versions when present
   Keep all three versions identical.
   Prefer `npm version <version> --no-git-tag-version` for `package.json` and
   `package-lock.json`, then update `system.json` with structured JSON editing.
10. Run `npm run build`.
11. If the release includes runtime, template, style, helper, rules, or test
    changes, run `npx vitest run`.
12. If release behavior changed, update `README.md` release or install
    instructions.
13. Review changed files:
    `git status --short` and `git diff -- system.json package.json package-lock.json`.
    Check for obvious path, manifest, template, generated-output, or version
    mistakes.
14. Commit user-facing/docs changes separately when practical.
15. Commit the release bump with:
    `git commit -m "Release v<version>"`.
16. Create the release tag on the release bump commit:
    `git tag -a v<version> -m "Release v<version>"`.
17. Push `main`.
18. Push the tag so GitHub Actions can publish release assets.
19. Create or update the GitHub release with `gh`.
20. Return the final release details listed in "Final Response".

## Release Notes

Generate release notes automatically from commits and changed files since the
latest tag. Use this format:

```markdown
## Added

- New user-visible features or content.

## Changed

- Behavior, UI, documentation, release, build, or dependency changes.

## Fixed

- Bug fixes, broken flows, incorrect rules behavior, or packaging fixes.
```

Rules for release notes:

- Keep the notes concise and user-facing.
- Mention internal-only work only when it helps explain the release.
- Prefer plain language over raw commit subjects.
- Use `Added`, `Changed`, and `Fixed` headings.
- Omit empty bullet lists only when there is truly nothing useful to say under
  that heading.
- If a change is ambiguous, put it under `Changed`.
- Save the notes to a temporary file such as
  `/tmp/yakov-dryh-release-notes-v<version>.md` for use with `gh`.

`gh release create --generate-notes` may be used only as a supplement or
cross-check. The agent must still produce release notes from the repository's
recent commits and return them to the user.

## GitHub Release Creation

Use non-interactive `gh` commands.

Create the GitHub release as a draft unless the user explicitly asks to publish
it immediately.

Preferred command after the tag is pushed:

```bash
gh release create "v<version>" \
  --repo iosipov27/yakov-dryh \
  --verify-tag \
  --draft \
  --title "v<version>" \
  --notes-file "/tmp/yakov-dryh-release-notes-v<version>.md"
```

If the release already exists because the GitHub Actions workflow created it
first, update it instead of creating a duplicate:

```bash
gh release edit "v<version>" \
  --repo iosipov27/yakov-dryh \
  --draft \
  --title "v<version>" \
  --notes-file "/tmp/yakov-dryh-release-notes-v<version>.md"
```

If the user asks for a published release instead of a draft, use
`--draft=false` with `gh release edit` after the release is ready.

If the workflow updates the release after the draft is created, check the final
draft state with `gh release view`. If the user requested a draft and the
release is published, run `gh release edit "v<version>" --draft` before
finishing.

Use this command to retrieve the release URL and current draft state:

```bash
gh release view "v<version>" \
  --repo iosipov27/yakov-dryh \
  --json url,isDraft,name,tagName
```

The GitHub Actions workflow remains responsible for attaching the final
`system.json` and `yakov-dryh.zip` assets. Do not manually upload replacement
assets unless the workflow failed and the user explicitly asks for a manual
fallback.

## Git Push Notes

This repository is often used from WSL in a Windows Foundry data directory.
Before assuming GitHub is unavailable, check both WSL and Windows Git paths.

Known working release push pattern:

1. Try the normal push first:
   `git push origin main` and `git push origin refs/tags/v<version>`.
   If you need branch and tag to move together, use
   `git push --atomic origin main refs/tags/v<version>`.
2. If WSL SSH fails with `Permission denied (publickey)`, check whether
   `~/.ssh` inside WSL actually contains a usable private key. In this workspace
   WSL may have only `known_hosts`.
3. Check whether Windows has the key at `/mnt/c/Users/iosip/.ssh/id_ed25519`.
   Do not assume OpenSSH can use it directly from `/mnt/c`; Windows-mounted keys
   may appear as mode `0777`, which SSH rejects as "UNPROTECTED PRIVATE KEY
   FILE".
4. Do not permanently copy private keys into the repository or commit them. If
   testing a Windows key from WSL is necessary, copy it to a temporary file with
   mode `600`, use it for that command only, and delete it immediately.
5. If the Windows key still is not accepted by GitHub, try Windows Git from the
   same checkout. Windows Git can use the Windows credential and SSH setup even
   when WSL cannot:

```bash
cmd.exe /c "cd /d C:\Users\iosip\AppData\Local\FoundryVTT\Data\systems\yakov-dryh && git push --atomic origin main refs/tags/v<version>"
```

Avoid Windows shell redirection like `2>NUL` from WSL unless needed; it can
create a stray `NUL` file in the checkout. If that happens, remove the untracked
file before finishing.

If SSH fetch fails, check remote refs over HTTPS without changing `origin`:

```bash
git ls-remote https://github.com/iosipov27/yakov-dryh.git refs/heads/main refs/tags/v<version>
```

## Release Validation

Release validation is opt-in. Only wait for GitHub Actions or check public URLs
when the user explicitly asks for validation after the push.

When validation is requested, prefer checking these public URLs:

- tag-specific manifest:
  - `https://github.com/iosipov27/yakov-dryh/releases/download/v<version>/system.json`
- tag-specific package:
  - `https://github.com/iosipov27/yakov-dryh/releases/download/v<version>/yakov-dryh.zip`
- latest manifest:
  - `https://github.com/iosipov27/yakov-dryh/releases/latest/download/system.json`
- latest package:
  - `https://github.com/iosipov27/yakov-dryh/releases/latest/download/yakov-dryh.zip`

If a pushed tag did not create release assets, check the `Release` workflow run in
GitHub Actions before changing manifest URLs.

Useful validation commands:

```bash
curl -fsSL "https://github.com/iosipov27/yakov-dryh/releases/download/v<version>/system.json"
curl -sIL "https://github.com/iosipov27/yakov-dryh/releases/download/v<version>/yakov-dryh.zip"
curl -fsSL "https://github.com/iosipov27/yakov-dryh/releases/latest/download/system.json"
```

Confirm the released manifest reports the intended `version`, keeps `manifest`
and `download` pointed at the `latest/download` asset URLs, and keeps Foundry
compatibility values in sync with `system.json`.

## Final Response

After every release attempt, summarize exactly what happened.

For a successful release, return:

- version
- tag
- release URL
- manifest URL
- download URL
- compatibility from `system.json`
- release notes
- whether the GitHub release is draft or published
- tests and build commands run

Use these tag-specific URLs in the final response:

- release URL:
  `https://github.com/iosipov27/yakov-dryh/releases/tag/v<version>`
- manifest URL:
  `https://github.com/iosipov27/yakov-dryh/releases/download/v<version>/system.json`
- download URL:
  `https://github.com/iosipov27/yakov-dryh/releases/download/v<version>/yakov-dryh.zip`

If release assets were not validated, say that the manifest and download URLs are
the expected tag-specific URLs and that asset validation was not requested.

## Foundry Add Version Form

After every successful release, include a table in the final response with the
values to enter in Foundry's `Add Version` form.

Use this exact shape:

| Field | Value |
| --- | --- |
| Version Number | `<version>` |
| Package Manifest URL | `https://github.com/iosipov27/yakov-dryh/releases/download/v<version>/system.json` |
| Release Notes URL | `https://github.com/iosipov27/yakov-dryh/releases/tag/v<version>` |
| Minimum Core Version | `<system.json compatibility.minimum>` |
| Verified Core Version | `<system.json compatibility.verified>` |
| Maximum Core Version | leave empty |

Use the tag-specific package manifest URL for the released version, not the
`latest` URL, so the Foundry package entry points at the exact release asset.
