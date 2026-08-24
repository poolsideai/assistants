__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

## Development setup

If you get to a working development setup different from what is documented
here, please add some notes about it!

__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
   this was written, the VM needs to have AMD64 architecture. VirtualBox has
__POOL_SYNTHETIC_IMPORT_BASELINE__
   suffice.
2. Install Visual Studio 2022, and make sure that you pick the extension
   development workload in the setup.
3. Create a shared drive with this repository as its root.
4. On the host system, in the `app/` directory, first run
   `pnpm run download:binaries` to fetch the highest published `helper/v*`
   runtime produced by a VS Code or Desktop release (this needs the `gh` CLI
   authenticated), then run
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
   play button to build and run it.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

### Prebuilt VSIX from CI

The **Build VSIX** workflow packages a complete extension — webview bundle and
helper included — for every push and pull request that touches this directory.
The `poolside-assistant-vsix` artifact on the run is installable, so reviewing
or testing a change does not always need a local Windows build. It is unsigned
and its version is whatever the manifest currently says, so it is for testing
only, never for distribution.

__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
- When you run the extension from Visual Studio during development, it is
  installed into an experimental instance of the IDE. There is a Start Menu
  item to reset this instance, if you want to get it back to a clean state
  (named Reset the Visual Studio 2022 Experimental Instance).
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  reopen the solution. If you get odd build errors, try reloading the solution
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
`Command Prompt`, then `Developer Command Prompt`. Then run:

__POOL_SYNTHETIC_IMPORT_BASELINE__
update-helper-types.bat
```

__POOL_SYNTHETIC_IMPORT_BASELINE__
if needed, runs it, then shuts down the helper.

## Update the helper

Run `pnpm run download:binaries` in the `app` directory. It resolves the highest
published release in the independent `helper/v*` lineage. Set
`POOLSIDE_HELPER_VERSION=helper/vM.m.p` to reproduce or test an exact helper
release. Follow the instructions above when helper API types also changed.

## Nightly releases from CI

The coordinated release train (`.github/workflows/release-products.yml`) can
release the extension as the `vs` product. A nightly release is an unsigned
VSIX published to GitHub Releases as a prerelease under a `vs-assistant/vX.Y.Z`
tag, with the signed helper from the shared `helper/v*` runtime inside.
Publication is gated on the `VS_RELEASES_ENABLED` and
`NIGHTLY_RELEASES_ENABLED` repository variables. Stable Marketplace releases
still follow the manual process below, but `make release-visual-studio`
records their tags in the same `vs-assistant/v*` lineage, so the nightly
planner continues from the latest stable version (for example, the first
nightly after stable 1.6.0 is 1.7.0). The retired `vs/v*` tags are not read
by the planner.

The release planner never invents the first version. A manual release through
`make release-visual-studio` binds the `vs-assistant/v*` tag lineage on its
own; to start nightlies before the first such release, bootstrap the lineage
once by planning an exact nightly version (odd minor) against the main tip and
pushing the annotated tag it produces:

```bash
cd ui/scripts/release-helper
plan=$(pnpm -s find-version plan vs --channel nightly --version 1.5.0 \
  --ref origin/main --tag-prefix vs-assistant \
  --destination "$(../../apps/vs-assistant/scripts/extension-identity.sh)" \
  --create-lineage)
git tag --annotate --message "$(jq -r '.tagAnnotation' <<<"$plan")" \
  "$(jq -r '.tag' <<<"$plan")" "$(jq -r '.sourceSha' <<<"$plan")"
git push origin "$(jq -r '.tag' <<<"$plan")"
```

Then run the **Release · Visual Studio** workflow right away, before main
moves: it resumes the reserved tag and publishes its GitHub release. Scheduled
nightlies take over from there.

__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

1. Ensure you have an SSL.com account that is part of the Poolside team, and
   that the code signing certificate is enrolled in eSigner (this is done in
   the SSL.com portal under Signing Credentials). **Important:** The "malware
   blocker" setting must be disabled on the signing credential, otherwise
   signing will fail with "hash needs to be scanned first" errors.

2. Install the [SSL.COM eSigner CKA](https://www.ssl.com/downloads/#cka)
   (Cloud Key Adapter). This installs a Cryptographic Service Provider that
__POOL_SYNTHETIC_IMPORT_BASELINE__

3. During eSigner CKA installation, you will be prompted to log in with your
   SSL.com credentials. This authenticates you and makes the certificate
   available through the Windows Certificate Store. Choose **Automated**
   signing mode if you want to sign without entering an OTP each time.
   Manual mode requires authenticator app confirmation for each signing
   operation.

4. Find your certificate thumbprint:
   - Press `Win+R` and run `certmgr.msc`
   - Navigate to **Personal > Certificates**
   - Double-click your SSL.com code signing certificate
   - Go to the **Details** tab and scroll to **Thumbprint**
   - Copy the value (remove any spaces)

5. Either set up an environment variable (restart your command prompt after):
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
   ```
   Or pass the thumbprint directly when running the signing script.

__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__

1. Create a branch `release-visual-studio-x.y.z` (with the version number)
2. Open the manifest in Visual Studio.
3. Update the version number
4. Make sure the "This release is in preview" checkbox is set correctly
   depending on if you want a preview release or not. (The version number
__POOL_SYNTHETIC_IMPORT_BASELINE__
5. Update the version number and dependencies in `./app/package.json`
6. Make a commit with the version bump, push it, and open a pull request
__POOL_SYNTHETIC_IMPORT_BASELINE__
   in the pull request).
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
10. Merge the release PR. The release tag joins the managed `vs-assistant/v*`
    lineage, whose planner requires the released commit to be on `main`.
11. Check out `main`, pull the merged release commit, and in the repository
    root run `make release-visual-studio`.
12. Back in the Windows Virtual Machine, set the configuration to "Release",
__POOL_SYNTHETIC_IMPORT_BASELINE__
13. Sign the VSIX. In a Developer Command Prompt, run:
__POOL_SYNTHETIC_IMPORT_BASELINE__
    sign-vsix.bat
    ```
14. Close Visual Studio. Find the newly built release (in the `bin\Release\net472`
    folder, named `poolside-assistant.vsix`). Install it into your Visual
    Studio instance.
15. Open Visual Studio. Run some test prompt to make sure it works OK after
    install.
16. Back on your host machine, press enter to complete the automated part of
    the release process, which pushes the annotated `vs-assistant/vX.Y.Z` tag
    and uploads the release to GitHub.
__POOL_SYNTHETIC_IMPORT_BASELINE__
    be in `bin\Release`).
