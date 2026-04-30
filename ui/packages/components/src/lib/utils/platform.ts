function getOperatingSystem() {
  const platform = navigator.platform;
  if (/^Win/i.test(platform)) return "Windows";
  if (/^Mac/i.test(platform)) return "Mac";
  if (/Linux|X11/i.test(platform)) return "Linux";
  if (/Android/i.test(platform)) return "Android";
  if (/iPhone|iPad|iPod/i.test(platform)) return "iOS";

  return;
}

export function isAppleUser() {
  const os = getOperatingSystem();
  return os === "Mac" || os === "iOS";
}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
