import { cyan } from "@std/fmt/colors";
import { join as joinPath } from "@std/path";
import { Command } from "@cliffy/command";

type BencheeRecordEntry = {
  duration: number;
  ts: string;
  bencheeCommand: string;
  cwd: string;
};

type BencheeRecordEntries = Array<BencheeRecordEntry>;

type BencheeRecord = {
  entries: BencheeRecordEntries;
  summary: {
    mean: number;
    median: number;
    min: number;
    max: number;
    stddev: number;
  };
};

type BencheeRecords = {
  [ref: string]: BencheeRecord;
};

function getSummary(entries: BencheeRecordEntries) {
  const durations = entries.map((entry) => entry.duration);
  const mean = durations.reduce((acc, curr) => acc + curr, 0) /
    durations.length;
  const sorted = durations.sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];
  const stddev = Math.sqrt(
    durations.reduce((acc, curr) => acc + (curr - mean) ** 2, 0) /
      durations.length,
  );

  return {
    mean,
    median,
    min,
    max,
    stddev,
  };
}

export default async function bencher() {
  const bencherCommand = await new Command()
    .version("0.1.0")
    .name("bencher")
    .option("-r,--ref <ref:string>", "git ref of benchee", {
      required: true,
    })
    .option("-o,--output <output:string>", "output file")
    .option("-q,--quiet", "suppress output")
    .description("benchmark a command")
    .parse(Deno.args);

  const options = bencherCommand.options;
  if (!options.ref) {
    console.error(
      'you must provide a "ref" which represents a version of the benchee',
    );
    Deno.exit(1);
  }

  if (options.quiet) {
    console.log = () => {};
  }

  const cwd = Deno.cwd();

  const [program, ...bencheeArgs] = bencherCommand.literal;

  // if the arg has a space, wrap it in quotes
  const bencheeCommand = `${program} ${
    bencheeArgs
      .map((arg) => {
        if (arg.includes(" ")) {
          return `"${arg}"`;
        }
        return arg;
      })
      .join(" ")
  }`;

  console.log(
    "benchmarking",
    cyan(bencheeCommand),
  );

  performance.mark("benchee-start");

  const command = new Deno.Command(program, {
    args: bencheeArgs,
  });

  const output = await command.output();
  performance.mark("benchee-end");
  performance.measure("benchee", "benchee-start", "benchee-end");

  const entries = performance.getEntriesByName("benchee");

  const bencheeEntry: BencheeRecordEntry = {
    duration: entries[0].duration,
    ts: new Date().toISOString(),
    bencheeCommand,
    cwd,
  };

  const outputFilePath = options.output ?? joinPath(cwd, "benchee.json");

  let existingRecordText = "{}";

  try {
    existingRecordText = await Deno.readTextFile(outputFilePath);
  } catch (_e) {
    // benchee.json doesn't exist, we'll just create it
  }

  let existingRecords: BencheeRecords;

  try {
    existingRecords = JSON.parse(existingRecordText) as BencheeRecords;
  } catch (_e) {
    // benchee.json failed to parse, we'll just overwrite it
    existingRecords = {};
  }

  let existingRecord = existingRecords?.[options.ref];

  if (existingRecord) {
    // malformed data: reset
    if (!existingRecord?.entries) {
      existingRecord.entries = [];
    }

    // malformed data: reset
    if (!existingRecord?.summary) {
      existingRecord.summary = {
        mean: -1,
        median: -1,
        min: -1,
        max: -1,
        stddev: -1,
      };
    }
  } else {
    existingRecord = {
      entries: [],
      summary: {
        mean: -1,
        median: -1,
        min: -1,
        max: -1,
        stddev: -1,
      },
    };
  }

  existingRecord.entries.push(bencheeEntry);

  const summary = getSummary(existingRecord.entries);

  const newRecords: BencheeRecords = {
    ...existingRecords,
    [options.ref]: {
      entries: existingRecord.entries,
      summary,
    },
  };

  Deno.writeTextFile(outputFilePath, JSON.stringify(newRecords, null, 2));

  console.log("\n--- output from benchee ---\n");

  if (output.code !== 0) {
    console.error(new TextDecoder().decode(output.stderr));
    Deno.exit(output.code);
  }

  console.log(new TextDecoder().decode(output.stdout));

  console.log("\n--- end output from benchee ---\n");
  console.log("bench complete!");
}
