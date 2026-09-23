// Probes real external hosts from inside a container to verify that the
// pentest sandbox's egress firewall (docker/apply-firewall.sh) actually
// blocks internet access. Exit code 0 = nothing reachable.
//
// CUSTOMIZE FOR YOUR PROJECT: add the real third-party hosts your app talks
// to (email/SMS/push providers, payment providers, analytics, ...) so this
// actually proves *your* integrations can't leak - not just some defaults.

const targets = [
  // Generic control hosts - always keep at least one of these.
  'https://1.1.1.1',
  'https://example.com'

  // Add your project's real third-party API hosts here, e.g.:
  // 'https://api.brevo.com',
  // 'https://exp.host',
];

const TIMEOUT_MS = 4000;

let reachable = 0;
let blocked = 0;

for (const url of targets) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    await fetch(url, { signal: controller.signal });
    console.log(`REACHABLE ${url}`);
    reachable++;
  } catch (error) {
    const reason = error?.cause?.code ?? error?.code ?? error?.name ?? String(error);
    console.log(`BLOCKED ${url} (${reason})`);
    blocked++;
  } finally {
    clearTimeout(timer);
  }
}

console.log(`\nsummary: ${blocked}/${targets.length} blocked, ${reachable}/${targets.length} reachable`);
process.exit(reachable > 0 ? 1 : 0);
