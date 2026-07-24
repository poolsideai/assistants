import semver from "semver";

__POOL_SYNTHETIC_IMPORT_BASELINE__
export type ReleaseChannel = "stable" | "nightly";
export type ReleaseBump = "patch" | "minor" | "major";

export interface VersionPlanInput {
  product: ReleaseProduct;
  channel: ReleaseChannel;
  bump: ReleaseBump;
  exactVersion?: string;
  exactVersionIsRecovery?: boolean;
  syncVersions: boolean;
  productVersions: string[];
  allProductVersions: string[];
}

export interface VersionPlan {
  version: string;
  productLocalCandidate: string | null;
  crossProductMaximum: string | null;
  alignmentFloor: string | null;
  exactVersion: boolean;
}

export interface CoordinatedVersionCandidate {
  product: ReleaseProduct;
  action: "release" | "resume" | "skip";
  version?: string;
  implicitRecovery?: boolean;
}

export interface CoordinatedVersionPlan {
  version: string | null;
  activeProducts: ReleaseProduct[];
  recovering: boolean;
}

function parseNumericVersion(version: string): semver.SemVer | null {
  const parsed = semver.parse(version);
  return parsed && parsed.prerelease.length === 0 && parsed.build.length === 0 ? parsed : null;
}

export function isNumericReleaseVersion(version: string): boolean {
  return parseNumericVersion(version) !== null;
}

export function versionMatchesChannel(version: string, channel: ReleaseChannel): boolean {
  const parsed = parseNumericVersion(version);
  if (!parsed) return false;
  return channel === "stable" ? parsed.minor % 2 === 0 : parsed.minor % 2 === 1;
}

export function validNumericVersions(versions: string[]): string[] {
  return [...new Set(versions.filter(isNumericReleaseVersion))].sort(semver.rcompare);
}

function nextChannelMinor(version: semver.SemVer, channel: ReleaseChannel): string {
  let minor = version.minor + 1;
  const wantsEven = channel === "stable";
  if ((minor % 2 === 0) !== wantsEven) minor += 1;
  return `${version.major}.${minor}.0`;
}

export function calculateLocalCandidate(
  versions: string[],
  channel: ReleaseChannel,
  bump: ReleaseBump,
): string | null {
  const latest = validNumericVersions(versions)[0];
  if (!latest) return null;

  const parsed = semver.parse(latest);
  if (!parsed) throw new Error(`Unexpected invalid version: ${latest}`);

  if (channel === "nightly") {
    return parsed.minor % 2 === 1
      ? `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`
      : nextChannelMinor(parsed, channel);
  }

  if (bump === "major") return `${parsed.major + 1}.0.0`;
  if (bump === "minor") return nextChannelMinor(parsed, channel);
  return parsed.minor % 2 === 0
    ? `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`
    : nextChannelMinor(parsed, channel);
}

export function calculateAlignmentFloor(
  versions: string[],
  channel: ReleaseChannel,
): string | null {
  const maximum = validNumericVersions(versions)[0];
  if (!maximum) return null;
  if (versionMatchesChannel(maximum, channel)) return maximum;

  const parsed = semver.parse(maximum);
  if (!parsed) throw new Error(`Unexpected invalid version: ${maximum}`);
  return nextChannelMinor(parsed, channel);
}

export function calculateVersionPlan(input: VersionPlanInput): VersionPlan {
  const productVersions = validNumericVersions(input.productVersions);
  const allProductVersions = validNumericVersions(input.allProductVersions);
  const crossProductMaximum = allProductVersions[0] ?? null;

  if (input.exactVersion) {
    if (!isNumericReleaseVersion(input.exactVersion)) {
      throw new Error(
        `Exact version ${input.exactVersion} must be numeric major.minor.patch without prerelease or build metadata`,
      );
    }
    if (!versionMatchesChannel(input.exactVersion, input.channel)) {
      throw new Error(
        `Exact version ${input.exactVersion} does not belong to the ${input.channel} channel`,
      );
    }
    const alignmentFloor = input.syncVersions
      ? calculateAlignmentFloor(allProductVersions, input.channel)
      : null;
    if (
      alignmentFloor &&
      semver.lt(input.exactVersion, alignmentFloor) &&
      !input.exactVersionIsRecovery
    ) {
      throw new Error(
        `Exact version ${input.exactVersion} is below the synchronized ${input.channel} floor ${alignmentFloor}; disable version synchronization to override it`,
      );
    }
    return {
      version: input.exactVersion,
      productLocalCandidate: null,
      crossProductMaximum,
      alignmentFloor,
      exactVersion: true,
    };
  }

  const productLocalCandidate = calculateLocalCandidate(productVersions, input.channel, input.bump);
  if (!productLocalCandidate) {
    throw new Error(
      `No ${input.product} tags exist; provide an exact --version for the first release`,
    );
  }

  const alignmentFloor = input.syncVersions
    ? calculateAlignmentFloor(allProductVersions, input.channel)
    : null;
  const version =
    alignmentFloor && semver.gt(alignmentFloor, productLocalCandidate)
      ? alignmentFloor
      : productLocalCandidate;

  if (productVersions.includes(version)) {
    throw new Error(`Calculated version ${version} already exists for ${input.product}`);
  }

  return {
    version,
    productLocalCandidate,
    crossProductMaximum,
    alignmentFloor,
    exactVersion: false,
  };
}

/**
 * Select one exact version for a coordinated multi-product release.
 *
 * Each product first calculates its own valid candidate from the same tag
 * snapshot. The coordinator uses the highest candidate, eliminating the
 * order-dependent drift that occurs when product workflows align and publish
 * sequentially.
 *
 * An unpublished tag already reserved at the source SHA wins during a retry.
 * The coordinator filters completed releases before calling this function.
 * Every other active product must still be able to use that reserved version;
 * otherwise a newer release has interleaved and the retry fails closed.
 */
export function calculateCoordinatedVersion(
  candidates: CoordinatedVersionCandidate[],
): CoordinatedVersionPlan {
  const active = candidates.filter(
    (candidate): candidate is CoordinatedVersionCandidate & { version: string } =>
      candidate.action !== "skip" && candidate.version !== undefined,
  );
  const missingVersion = candidates.find(
    (candidate) => candidate.action !== "skip" && candidate.version === undefined,
  );
  if (missingVersion) {
    throw new Error(`Active ${missingVersion.product} release plan has no version`);
  }
  if (active.length === 0) {
    return { version: null, activeProducts: [], recovering: false };
  }

  const recoveries = active.filter(
    (candidate) => candidate.action === "resume" && candidate.implicitRecovery === true,
  );
  const recoveryVersions = validNumericVersions(recoveries.map((candidate) => candidate.version));
  if (recoveryVersions.length > 1) {
    throw new Error(
      `Coordinated release tags at the source SHA disagree: ${recoveryVersions.join(", ")}`,
    );
  }

  const recoveryVersion = recoveryVersions[0];
  if (recoveryVersion) {
    const advanced = active.find((candidate) => semver.gt(candidate.version, recoveryVersion));
    if (advanced) {
      throw new Error(
        `${advanced.product} now requires ${advanced.version}, above reserved coordinated version ${recoveryVersion}`,
      );
    }
  }

  return {
    version:
      recoveryVersion ?? validNumericVersions(active.map((candidate) => candidate.version))[0],
    activeProducts: active.map((candidate) => candidate.product),
    recovering: recoveryVersion !== undefined,
  };
}
