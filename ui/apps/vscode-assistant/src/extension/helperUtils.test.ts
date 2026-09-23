import { _getValidHelperTarget } from "./helperUtils";

describe("_getValidHelperTarget", () => {
  it("transforms known targets", () => {
    expect(_getValidHelperTarget("win32", "x64")).toEqual({ platform: "windows", arch: "amd64" });
    expect(_getValidHelperTarget("darwin", "arm64")).toEqual({ platform: "darwin", arch: "arm64" });
    expect(_getValidHelperTarget("linux", "x64")).toEqual({ platform: "linux", arch: "amd64" });
  });

  it("throws errors on unsupported platforms", () => {
    expect(() => _getValidHelperTarget("unknown" as any, "x64")).toThrow(
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
    expect(() => _getValidHelperTarget("win32", "unknown")).toThrow(
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
  });
});
