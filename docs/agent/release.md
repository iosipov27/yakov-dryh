# Release Workflow

Use this file when the user asks to prepare, publish, draft, validate, or
explain a release for this Foundry system.

The default release process is automated and uses:

- git commits and tags for version history
- WSL / Ubuntu commands for all local release work
- GitHub CLI (`gh`) from WSL / Ubuntu for release creation and release notes
- the repository GitHub Actions release workflow for packaged release assets

Do not switch the install URLs away from GitHub Release assets unless the user
explicitly asks for that behavior.

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

## WSL-Only Toolchain Policy

Run all release commands from Ubuntu / WSL using Linux-native tools. Do not use
Windows executables or shims during release work unless the user explicitly asks
for a Windows fallback.

Do not use these during a normal release:

- `cmd.exe`
- `powershell.exe`
- `node.exe`
- `npm.cmd`
- `npx.cmd`
- Windows Git from `C:\Program Files\Git`
- Node, npm, or npx resolved from `/mnt/c/Program Files/nodejs`
- package manager shims from `/mnt/c/Users/.../AppData/Roaming/npm`

Before editing release versions, confirm the local toolchain is WSL-native:

```bash
command -v node
command -v npm
command -v npx
command -v git
command -v gh
node -p "process.platform + ' ' + process.version"
npm -v
```

The `node -p` command must print `linux ...`. `node`, `npm`, and `npx` should
resolve under WSL paths such as `/usr/bin`, `/usr/local/bin`, or
`/home/<user>/.nvm/...`, not under `/mnt/c/...`.

Use Node 20 in WSL to match the GitHub Actions release workflow. If WSL-native
Node is missing, stop and ask the user to install it, for example with `nvm`.
If Node was just installed with `nvm` but `command -v node` still fails, open a
new WSL shell or source the shell profile, for example `source ~/.bashrc`, before
continuing. After installing or changing Node, rebuild dependencies from WSL:

```bash
rm -rf node_modules
npm ci
```

Treat `node_modules` as platform-specific. Do not run Windows `npm install` or
Windows `npm ci` in this checkout for release preparation, because that can
create mixed Linux / Windows shims and optional native dependencies.

Common signs of a mixed toolchain are:

- `sass` is not recognized as an internal or external command
- `/usr/bin/env: 'node': No such file or directory`
- missing `rolldown`, `vite`, or `vitest` optional native bindings
- `node -p "process.platform"` reports `win32`
- `command -v npm` or `command -v npx` points into `/mnt/c/...`

If any of these happen, do not switch to Windows commands. Stop, restore the
WSL-native toolchain, run `rm -rf node_modules && npm ci`, then restart the
release checks from the beginning.

## Automated Release Checklist

Follow this checklist in order.

1. Confirm the working tree:
   `git status --short --branch`.
   Note any uncommitted user changes. Do not overwrite or revert them. If they
   would ship in the release, say so clearly.
2. Confirm the WSL-only toolchain from "WSL-Only Toolchain Policy":
   `command -v node npm npx git gh`,
   `node -p "process.platform + ' ' + process.version"`, and `npm -v`.
   If `node` reports anything other than `linux`, or if `node`, `npm`, or `npx`
   resolves under `/mnt/c/...`, stop and fix the WSL environment before
   releasing.
3. Confirm GitHub CLI is available and authenticated:
   `command -v gh` and `gh auth status`.
   If `gh` is missing or not authenticated, stop and ask the user to install or
   log in with `gh auth login`.
4. If `node_modules` is missing or may have been installed by Windows npm, reset
   dependencies from WSL:
   `rm -rf node_modules && npm ci`.
   Do not run Windows `npm install` to repair missing shims.
5. Fetch current remote state:
   `git fetch --tags --prune origin`.
   If SSH fetch fails, use the HTTPS remote checks from "Git Push Notes" without
   changing `origin`.
6. Confirm the release branch:
   `git status --short --branch` and `git rev-parse --abbrev-ref HEAD`.
   The normal release branch is `main`. Do not release from another branch unless
   the user explicitly asks.
7. Find the latest release tag:
   `git tag --list 'v*' --sort=-v:refname | head`.
8. Analyze commits and files changed since the latest tag:
   `git log --date=short --format='%h %ad %s' <last-tag>..HEAD`
   and `git diff --name-status <last-tag>..HEAD`.
   If there are no commits since the latest tag, stop unless the user explicitly
   asks to reissue the release.
9. Suggest the next semver version:
   - patch for fixes, docs, styles, build changes, and small behavior changes
   - minor for new user-visible features, new sheets, new gameplay flows, or
     meaningful Foundry behavior changes
   - major only for explicit breaking changes, manifest compatibility breaks, or
     migration-heavy schema changes
   For pre-`1.0.0` releases, prefer `0.x.y` patch/minor bumps unless the user
   explicitly asks for `1.0.0`.
10. Generate release notes before editing versions. Use commits and changed files
   since the latest tag as the source of truth. Do not invent changes.
11. Update versions:
   - `system.json` `version`
   - `package.json` `version`
   - `package-lock.json` root versions when present
   Keep all three versions identical.
   Prefer `npm version <version> --no-git-tag-version` for `package.json` and
   `package-lock.json`, then update `system.json` with structured JSON editing.
12. Run `npm run build`.
13. If the release includes runtime, template, style, helper, rules, or test
    changes, run `npx vitest run`.
14. If release behavior changed, update `README.md` release or install
    instructions.
15. Review changed files:
    `git status --short` and `git diff -- system.json package.json package-lock.json`.
    Check for obvious path, manifest, template, generated-output, or version
    mistakes.
16. Commit user-facing/docs changes separately when practical.
17. Commit the release bump with:
    `git commit -m "Release v<version>"`.
18. Create the release tag on the release bump commit:
    `git tag -a v<version> -m "Release v<version>"`.
19. Push `main`.
20. Push the tag so GitHub Actions can publish release assets.
21. Create or update the GitHub release with `gh`.
22. Return the final release details listed in "Final Response".

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

This repository is used from WSL in a Windows Foundry data directory, but release
pushes must still use WSL-native Git and SSH / HTTPS credentials.

Known working release push pattern:

1. Try the normal push first:
   `git push origin main` and `git push origin refs/tags/v<version>`.
   If you need branch and tag to move together, use
   `git push --atomic origin main refs/tags/v<version>`.
2. If WSL SSH fails with `Permission denied (publickey)`, check whether
   `~/.ssh` inside WSL actually contains a usable private key. In this workspace
   WSL may have only `known_hosts`.
3. Fix WSL Git authentication directly, for example by logging in with `gh auth
   login`, configuring HTTPS credentials through `gh`, or adding a WSL-readable
   SSH key to `~/.ssh` with correct permissions.
4. Do not permanently copy private keys into the repository or commit them.
5. Do not fall back to Windows Git from this checkout during release work.

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
