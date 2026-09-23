__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
 * User-facing changelog generator for the tag-driven release flow.
__POOL_SYNTHETIC_IMPORT_BASELINE__
 * The core (`parseGitLog` / `filterUserFacing` / `groupCommits` /
 * `renderChangelogFile`) is pure so it is unit-testable without touching git.
 * `collectCommits` is the only function that shells out.
__POOL_SYNTHETIC_IMPORT_BASELINE__
 * The default markdown is written for end users and is shared by the GitHub
 * release notes, the CrabNebula release notes, and the stamped product
 * `CHANGELOG.md`: no commit hashes, authors, repository links, or
 * ticket/pull-request references (the repository and tracker are private, so
 * `(#123)` and `PE-1234` mean nothing externally), a noise filter for commits
 * that only touch docs or lockfiles, and Improvements/Fixes grouping. The
 * Slack variant stays internal-facing with authors and pull-request links.
 * Paths are scoped to an app's owning dirs (from `projects.yml`) so
 * shared-package changes appear in every app that bundles them, while another
 * app's commits are excluded.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

/** Conventional-commit types that never produce a user-facing entry. */
const EXCLUDED_TYPES = new Set(["chore", "ci", "docs", "test", "build", "refactor", "style"]);

/**
 * Files that alone never make a commit user-facing. Matched against the
 * commit's changed paths after pathspec filtering to the owning dirs, so a
 * README tweak inside an owned app directory is dropped while a commit that
 * also touches code is kept.
 */
const NOISE_FILE_RE = /(^|\/)(?:[^/]+\.md|pnpm-lock\.yaml|MODULE\.bazel\.lock)$/iu;

const NO_CHANGES_LINE = "_No user-facing changes in this release._";
const INITIAL_RELEASE_LINE = "_Initial release._";
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
  /**
   * Subject with the `type(scope):` prefix and any tracker references stripped
   * (falls back to `subject`). See stripReferences.
   */
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /** Changed paths within the owning dirs (already pathspec-filtered by git). */
  files: string[];
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
  /** User-facing markdown shared by GitHub, CrabNebula, and CHANGELOG.md stamping. */
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /** Truncated internal Slack variant (mrkdwn link syntax, authors, PR links). */
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/** One `## version` section of a stamped CHANGELOG.md, newest first. */
export interface ChangelogFileSection {
  version: string;
  /** True for the in-flight nightly section; stable history sections are false. */
  preview: boolean;
  /** ISO date (YYYY-MM-DD) of the release commit. */
  date: string;
  /** Pre-rendered user-facing body (see renderUserBody). */
  body: string;
}
__POOL_SYNTHETIC_IMPORT_BASELINE__
const CONVENTIONAL_RE = /^(\w+)(?:\(([^)]+)\))?(!)?:\s+(.*)$/;
__POOL_SYNTHETIC_IMPORT_BASELINE__
/** Squash-merge pull-request numbers, anywhere in the subject: `… (#568)`. */
const PULL_REQUEST_REF_RE = /\s*\(#\d+\)/gu;

/**
 * A tracker key: an uppercase team prefix and an issue number, `PE-2474`. The
 * lookahead spares standards tokens that share the shape — a subject may open
 * or close with `UTF-8` or `SHA-256`, and no team files issues under those.
 */
const TICKET_KEY = String.raw`(?!(?:UTF|SHA|AES|RSA|MD|CRC|ISO|RFC|IEEE)-)[A-Z][A-Z0-9]*-\d+`;

/** Leading keys: `PE-2463: …`, `[PE-2400] …`, `DOC-131 PE-2356 …`. */
const TICKET_PREFIX_RE = new RegExp(
  String.raw`^(?:(?:\[${TICKET_KEY}\]|${TICKET_KEY})\s*[:,-]?\s+)+`,
  "u",
);
/** A parenthesized aside holding nothing but keys: `… the app (PE-2474)`. */
const TICKET_ASIDE_RE = new RegExp(String.raw`\s*\(${TICKET_KEY}(?:\s*,\s*${TICKET_KEY})*\)`, "gu");
/** A trailing key: `Remove stale infra references PE-2255`. */
const TICKET_SUFFIX_RE = new RegExp(String.raw`\s+${TICKET_KEY}\s*$`, "u");

/**
 * Drop references that mean nothing to an end user: pull-request numbers and
 * Linear ticket keys. Both the repository and the tracker are private, so
 * `(#568)` and `PE-2474` are noise in user-facing copy (the Slack variant
 * keeps them — it reads `subject`, not `description`).
 *
 * Asides must fill their parentheses entirely, so prose like `(build/plan)` or
 * `(PE-2329 follow-up)` survives intact — leaving a stray key is better than
 * mangling a sentence. A stripped-to-empty subject keeps its original text
 * rather than rendering a bare bullet.
 */
function stripReferences(description: string): string {
  const stripped = description
    .replace(PULL_REQUEST_REF_RE, "")
    .replace(TICKET_PREFIX_RE, "")
    .replace(TICKET_ASIDE_RE, "")
    .replace(TICKET_SUFFIX_RE, "")
    .trim();
  return stripped || description;
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      description: stripReferences(subject),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    description: stripReferences(description.trim() || subject),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
 * Parse `git log` records produced with
 * `--pretty=format:%x1e%H%x1f%an%x1f%s --name-only` into structured commits.
 * Records are separated by \x1e; each record's first line is the header and
 * every following non-empty line is a changed path.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  return raw
    .split("\x1e")
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [header = "", ...rest] = record.split(/\r?\n/u);
      const [sha = "", authorName, ...subjectParts] = header.split("\x1f");
      const subject = subjectParts.join("\x1f").trim() || sha.slice(0, 12);
      return {
        sha,
        shortSha: sha.slice(0, 12),
        authorName: authorName?.trim() || "Unknown author",
        subject,
        files: rest.map((line) => line.trim()).filter(Boolean),
        ...classify(subject),
      };
    });
}
__POOL_SYNTHETIC_IMPORT_BASELINE__
/**
 * Drop commits that end users should never see: excluded conventional types
 * (chores, CI, docs, …) and commits whose owned-path changes are only
 * documentation or lockfiles.
 */
export function filterUserFacing(commits: CommitEntry[]): CommitEntry[] {
  return commits.filter((commit) => {
    if (commit.type && EXCLUDED_TYPES.has(commit.type)) return false;
    if (commit.files.length > 0 && commit.files.every((file) => NOISE_FILE_RE.test(file))) {
      return false;
    }
    return true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/**
 * Fixes vs Improvements. Conventional `fix:` is authoritative; otherwise the
 * subjects here are reliably verb-first, so a small verb list decides.
 */
const FIX_VERB_RE = /^(?:fix(?:es|ed)?|correct(?:s|ed)?|repair(?:s|ed)?|resolve(?:s|d)?)\b/iu;

function isFix(commit: CommitEntry): boolean {
  if (commit.type) return commit.type === "fix";
  return FIX_VERB_RE.test(commit.description);
}

function userBullet(commit: CommitEntry): string {
  const breaking = commit.breaking ? " **(breaking)**" : "";
  return `- ${commit.description}${breaking}`;
}

/**
 * Render the grouped user-facing body (`### Improvements` / `### Fixes`) for
 * one release range, without any version heading.
 */
export function renderUserBody(commits: CommitEntry[]): string {
  const userFacing = filterUserFacing(commits);
  if (userFacing.length === 0) {
    return NO_CHANGES_LINE;
  }
  const improvements = userFacing.filter((commit) => !isFix(commit));
  const fixes = userFacing.filter(isFix);
  const lines: string[] = [];
  if (improvements.length > 0) {
    lines.push("### Improvements", "", ...improvements.map(userBullet), "");
  }
  if (fixes.length > 0) {
    lines.push("### Fixes", "", ...fixes.map(userBullet), "");
  }
  return lines.join("\n").trim();
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
/** `desktop/v1.2.0` -> `1.2.0` for user-facing copy; unknown shapes pass through. */
function displayVersion(tag: string): string {
  const match = tag.match(/\/v((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/u);
  return match ? match[1] : tag;
}

/** Build the user-facing markdown + internal Slack changelog from parsed commits. */
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      release: `${INITIAL_RELEASE_LINE}\n`,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // --- User-facing markdown ---------------------------------------------------
  const release = [`## Changes since ${displayVersion(prevTag)}`, "", renderUserBody(commits)]
    .join("\n")
    .concat("\n");
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // --- Slack mrkdwn variant, internal: authors + PR links, flat + truncated ---
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  return { release, slack: slackLines.join("\n") };
}

/** Assemble a complete stamped CHANGELOG.md from per-release sections. */
export function renderChangelogFile(sections: ChangelogFileSection[]): string {
  const lines: string[] = ["# Changelog", ""];
  for (const section of sections) {
    const preview = section.preview ? " (Preview)" : "";
    lines.push(`## ${section.version}${preview} — ${section.date}`, "", section.body.trim(), "");
  }
  return lines.join("\n").trim() + "\n";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
 * Run `git log --first-parent <prevTag>..<headSha> -- <dirs>` with `--name-only`
 * and parse the result. When `prevTag` is null there is no meaningful range.
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
    "--pretty=format:%x1e%H%x1f%an%x1f%s",
    "--name-only",
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

/** Collect one release range and render just its user-facing body. */
export function collectUserBody(params: {
  repoRoot: string;
  dirs: string[];
  prevTag: string | null;
  headSha: string;
}): string {
  if (!params.prevTag) {
    return INITIAL_RELEASE_LINE;
  }
  return renderUserBody(collectCommits(params));
}
