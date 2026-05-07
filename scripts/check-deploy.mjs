import { execSync } from "node:child_process";

function run(command) {
  return execSync(command, { encoding: "utf8" }).trim();
}

function parseRepoFromRemote(remoteUrl) {
  // Supports:
  // - https://github.com/owner/repo.git
  // - git@github.com:owner/repo.git
  const httpsMatch = remoteUrl.match(/github\.com\/([^/]+)\/([^/.]+)(?:\.git)?$/);
  if (httpsMatch) return { owner: httpsMatch[1], repo: httpsMatch[2] };

  const sshMatch = remoteUrl.match(/github\.com:([^/]+)\/([^/.]+)(?:\.git)?$/);
  if (sshMatch) return { owner: sshMatch[1], repo: sshMatch[2] };

  return null;
}

async function main() {
  let remote;
  let sha;

  try {
    remote = run("git remote get-url origin");
    sha = run("git rev-parse HEAD");
  } catch {
    console.error("Could not read git metadata. Run this inside the repository.");
    process.exit(1);
  }

  const repoInfo = parseRepoFromRemote(remote);
  if (!repoInfo) {
    console.error(`Could not parse GitHub owner/repo from remote: ${remote}`);
    process.exit(1);
  }

  const { owner, repo } = repoInfo;
  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}/status`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "deploy-check-script",
    },
  });

  if (!response.ok) {
    console.error(`GitHub API request failed: ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const data = await response.json();
  const vercelStatus = (data.statuses || []).find((s) => s.context === "Vercel");

  console.log(`Repo: ${owner}/${repo}`);
  console.log(`Commit: ${sha}`);
  console.log(`Overall status state: ${data.state || "unknown"}`);

  if (!vercelStatus) {
    console.log("Vercel status: not found yet for this commit.");
    console.log("This may mean deployment has not started, is still queued, or integration is misconfigured.");
    process.exit(2);
  }

  console.log(`Vercel state: ${vercelStatus.state}`);
  console.log(`Vercel description: ${vercelStatus.description || "n/a"}`);
  console.log(`Vercel deployment URL: ${vercelStatus.target_url || "n/a"}`);

  if (vercelStatus.state !== "success") {
    process.exit(2);
  }
}

main().catch((error) => {
  console.error("Unexpected error while checking deployment status.");
  console.error(error);
  process.exit(1);
});
