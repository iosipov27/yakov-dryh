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

1. Update the version in `system.json`.
2. Update the version in `package.json`.
3. Run `npm run build`.
4. If release behavior changed, update `README.md` release or install
   instructions.
5. Commit the release bump.
6. Create a git tag in the form `v<version>`.
7. Push the branch and the tag so GitHub Actions can publish the release assets.

## Release Validation

After a release, prefer checking these public URLs:

- latest manifest:
  - `https://github.com/iosipov27/yakov-dryh/releases/latest/download/system.json`
- latest package:
  - `https://github.com/iosipov27/yakov-dryh/releases/latest/download/yakov-dryh.zip`

If a pushed tag did not create release assets, check the `Release` workflow run in
GitHub Actions before changing manifest URLs.

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
