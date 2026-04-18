# Release Workflow

Use this repository's GitHub Actions release flow as the default release process.

## Workflow

- Release workflow file: `.github/workflows/release.yml`
- Trigger: pushing a git tag matching `v*`, for example `v0.1.0`
- Manual fallback: run the same workflow from GitHub Actions with
  `workflow_dispatch` and provide an existing tag
- Release assets produced by the workflow:
  - `system.json`
  - `yakov-dryh.zip`

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

## Release Preparation Checklist

When preparing a release:

1. Check `git status --short --branch` and note whether local `main` already has
   commits ahead of `origin/main`. If it does, those commits will ship in the
   release unless the user explicitly asks for a different branch strategy.
2. Check the latest local release tag with
   `git tag --list 'v*' --sort=-v:refname | head`.
3. If SSH fetch fails, check remote refs over HTTPS without changing `origin`:
   `git ls-remote https://github.com/iosipov27/yakov-dryh.git refs/heads/main refs/tags/v<version>`.
4. Update the version in `system.json`.
5. Update the version in `package.json`.
6. Run `npm run build`.
7. If the release includes runtime, template, style, or test changes, run
   `npx vitest run`.
8. If release behavior changed, update `README.md` release or install
   instructions.
9. Commit any user-facing/docs changes separately when practical.
10. Commit the release bump with `Release v<version>`.
11. Create a git tag in the form `v<version>` on the release bump commit.
12. Push the branch and the tag so GitHub Actions can publish the release assets.

## Git Push Notes

This repository is often used from WSL in a Windows Foundry data directory.
Before assuming GitHub is unavailable, check both WSL and Windows Git paths.

Known working release push pattern:

1. Try the normal push first:
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

## Release Validation

After a release, prefer checking these public URLs:

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
