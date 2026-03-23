const dotenv = require("dotenv");
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

dotenv.config();

yargs(hideBin(process.argv))
  .scriptName("ourgit")
  .command("init", "Initialise a new repository", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to the repository",
    (commandYargs) => {
      commandYargs.positional("file", {
        describe: "File to add to the staging area",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.file);
    }
  )
  .command(
    "commit <message>",
    "Commit the staged files",
    (commandYargs) => {
      commandYargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    (argv) => {
      commitRepo(argv.message);
    }
  )
  .command(
    "branch <name>",
    "Create a new branch from the current HEAD",
    (commandYargs) => {
      commandYargs.positional("name", {
        describe: "Branch name",
        type: "string",
      });
    },
    (argv) => {
      createBranchRepo(argv.name);
    }
  )
  .command(
    "checkout <name>",
    "Switch to a branch",
    (commandYargs) => {
      commandYargs.positional("name", {
        describe: "Branch name",
        type: "string",
      });
    },
    (argv) => {
      checkoutBranchRepo(argv.name);
    }
  )
  .command(
    "merge <name>",
    "Merge a branch into the current branch",
    (commandYargs) => {
      commandYargs.positional("name", {
        describe: "Source branch name",
        type: "string",
      });
    },
    (argv) => {
      mergeBranchRepo(argv.name);
    }
  )
  .demandCommand(1, "You need at least one command")
  .help()
  .strict()
  .parse();
