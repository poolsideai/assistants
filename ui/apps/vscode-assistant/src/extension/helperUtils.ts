import os from "os";

/**
 * maps to go equivalents of platform/arch
 */
export function _getValidHelperTarget(osPlatform = os.platform(), osArch = os.arch()) {
  // https://nodejs.org/api/os.html#osplatform
  // https://gist.github.com/asukakenji/f15ba7e588ac42795f421b48b8aede63#goos-values
  const platformMap: Record<string, string> = {
    win32: "windows",
    darwin: "darwin",
    linux: "linux",
  };

  // https://nodejs.org/api/os.html#osarch
  // https://gist.github.com/asukakenji/f15ba7e588ac42795f421b48b8aede63#goarch-values
  // we only include 64-bit builds
  const archMap: Record<string, string> = {
    x64: "amd64",
    arm64: "arm64",
  };

  const goPlatform = platformMap[osPlatform];
  const goArch = archMap[osArch];

  if (!goPlatform || !goArch) {
    throw new Error(`Unsupported platform/architecture: ${osPlatform}/${osArch}`);
  }

  return { platform: goPlatform, arch: goArch };
}
