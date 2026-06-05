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
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    sign-vsix.bat
    ```
__POOL_SYNTHETIC_IMPORT_BASELINE__
    folder, named `poolside-assistant.vsix`). Install it into your Visual
    Studio instance.
__POOL_SYNTHETIC_IMPORT_BASELINE__
    install.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    be in `bin\Release`).
