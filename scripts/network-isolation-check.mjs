// Probes real external hosts from inside a container to verify that the
// pentest sandbox's egress firewall (docker/apply-firewall.sh) actually
// blocks internet access. Exit code 0 = nothing reachable.
//
// CUSTOMIZE FOR YOUR PROJECT: add the real third-party hosts your app talks
// to (email/SMS/push providers, payment providers, analytics, ...) so this
// actually proves *your* integrations can't leak - not just some defaults.

const targets = [
  // Generic control hosts - always keep at least one of these.
  "https://1.1.1.1",
  "https://example.com",

  // Add your project's real third-party API hosts here, e.g.:
  // 'https://api.brevo.com',
  // 'https://exp.host',
];

const TIMEOUT_MS = 4000;

/** @param {unknown} error */
function describeError(error) {
  if (error instanceof Error) {
    const cause = error.cause;

    if (cause && typeof cause === "object" && "code" in cause) {
      return String(cause.code);
    }
    if ("code" in error && typeof error.code === "string") {
      return error.code;
    }

    return error.name;
  }

  return String(error);
}

/** @param {string} url */
async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    await fetch(url, { signal: controller.signal });
    console.log(`REACHABLE ${url}`);
    return true;
  } catch (error) {
    console.log(`BLOCKED ${url} (${describeError(error)})`);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

const results = await Promise.all(targets.map((url) => probe(url)));
const reachableCount = results.filter(Boolean).length;
const blockedCount = results.length - reachableCount;

console.log(
  `\nsummary: ${String(blockedCount)}/${String(targets.length)} blocked, ${String(reachableCount)}/${String(targets.length)} reachable`,
);
process.exit(reachableCount > 0 ? 1 : 0);
