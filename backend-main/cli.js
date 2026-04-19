const dotenv = require("dotenv");
const path = require("path");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const {
  checkoutBranchRepo,
  createBranchRepo,
  mergeBranchRepo,
} = require("./controllers/branch");

dotenv.config({ path: path.join(__dirname, ".env") });

// ── Helpers ──────────────────────────────────────────────────────────────────

const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  dim:    "\x1b[2m",
  cyan:   "\x1b[36m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  blue:   "\x1b[34m",
  magenta:"\x1b[35m",
  white:  "\x1b[97m",
  gray:   "\x1b[90m",
};

function printBanner() {
  console.log(`\n${c.cyan}${c.bold}  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗${c.reset}`);
  console.log(`${c.cyan}${c.bold}  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝${c.reset}`);
  console.log(`${c.cyan}${c.bold}  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗${c.reset}`);
  console.log(`${c.cyan}${c.bold}  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║${c.reset}`);
  console.log(`${c.cyan}${c.bold}  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║${c.reset}`);
  console.log(`${c.cyan}${c.bold}  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝${c.reset}`);
  console.log(`${c.gray}  Version Control System — custom-built from scratch${c.reset}\n`);
}

async function logCommand() {
  const {
    getBranchHead,
    getCommitMetadataByHash,
    getCurrentBranch,
    readBranches,
  } = require("./utils/commitMetadata");
  const { getRepoPath } = require("./services/vcs/paths");

  const repoPath = getRepoPath();

  try {
    const currentBranch = await getCurrentBranch(repoPath);
    const branches = await readBranches(repoPath);
    const headHash = await getBranchHead(repoPath, currentBranch);

    const queue = [headHash];
    const visited = new Set();
    const commits = [];

    while (queue.length > 0) {
      const hash = queue.shift();
      if (!hash || visited.has(hash)) continue;
      visited.add(hash);
      const meta = await getCommitMetadataByHash(repoPath, hash);
      if (!meta) continue;
      commits.push(meta);
      if (meta.parent1 || meta.parent) queue.push(meta.parent1 || meta.parent);
      if (meta.parent2) queue.push(meta.parent2);
    }

    commits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    console.log(`\n${c.bold}${c.white}  Commit log — ${c.cyan}${currentBranch}${c.reset}`);
    console.log(`${c.gray}  ${"─".repeat(72)}${c.reset}\n`);

    const allBranchHeads = new Map(Object.entries(branches));
    const headsByHash = new Map();
    for (const [name, h] of allBranchHeads) {
      if (!headsByHash.has(h)) headsByHash.set(h, []);
      headsByHash.get(h).push(name);
    }

    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      const isHead = i === 0;
      const branchLabels = headsByHash.get(commit.hash) || [];
      const isMerge = Boolean(commit.parent2);

      // Hash line
      process.stdout.write(`  ${c.yellow}commit ${commit.hash}${c.reset}`);
      if (isHead) process.stdout.write(` ${c.cyan}(HEAD → ${currentBranch})${c.reset}`);
      else if (branchLabels.length) process.stdout.write(` ${c.cyan}(${branchLabels.join(", ")})${c.reset}`);
      if (isMerge) process.stdout.write(` ${c.magenta}[merge]${c.reset}`);
      console.log();

      if (isMerge) {
        console.log(`  ${c.gray}Merge: ${(commit.parent1 || commit.parent || "").slice(0, 10)} ${commit.parent2.slice(0, 10)}${c.reset}`);
      }
      console.log(`  ${c.gray}Date:  ${new Date(commit.timestamp).toLocaleString()}${c.reset}`);
      console.log(`\n    ${c.white}${commit.message}${c.reset}`);
      if (commit.files?.length) {
        console.log(`    ${c.gray}Files: ${commit.files.join(", ")}${c.reset}`);
      }
      console.log();
    }

    if (commits.length === 0) {
      console.log(`  ${c.gray}No commits found on branch '${currentBranch}'.${c.reset}\n`);
    }
  } catch (err) {
    console.error(`  ${c.magenta}Error:${c.reset} ${err.message}`);
    process.exit(1);
  }
}

// ── CLI ───────────────────────────────────────────────────────────────────────

yargs(hideBin(process.argv))
  .scriptName("nexus")
  .usage("Usage: node cli.js <command> [args]")
  .command("init", "Initialise a new Nexus repository", {}, () => {
    printBanner();
    initRepo();
  })
  .command(
    "add <file>",
    "Stage a file for the next commit",
    (y) => {
      y.positional("file", { describe: "File path to stage", type: "string" });
    },
    (argv) => addRepo(argv.file)
  )
  .command(
    "commit <message>",
    "Create a snapshot commit of staged files",
    (y) => {
      y.positional("message", { describe: "Commit message", type: "string" });
    },
    (argv) => commitRepo(argv.message)
  )
  .command(
    "branch <name>",
    "Create a new branch from current HEAD",
    (y) => {
      y.positional("name", { describe: "Branch name", type: "string" });
    },
    (argv) => createBranchRepo(argv.name)
  )
  .command(
    "checkout <name>",
    "Switch to a branch",
    (y) => {
      y.positional("name", { describe: "Branch name", type: "string" });
    },
    (argv) => checkoutBranchRepo(argv.name)
  )
  .command(
    "merge <name>",
    "Merge a branch into the current branch",
    (y) => {
      y.positional("name", { describe: "Source branch to merge in", type: "string" });
    },
    (argv) => mergeBranchRepo(argv.name)
  )
  .command(
    "log",
    "Show formatted commit history for the current branch",
    {},
    logCommand
  )
  .demandCommand(1, `\nRun ${c.cyan}node cli.js --help${c.reset} to see available commands.\n`)
  .help()
  .strict()
  .parse();
