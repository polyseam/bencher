import { Command, cyan, path } from "deps";

type BencheeRecordEntry = {
  duration: number;
  ts: string;
  bencheeCommand: string;
  cwd: string;
};

type BencheeRecordEntries = Array<BencheeRecordEntry>;

type BencheeRecord = {
  [ref: string]: BencheeRecordEntries;
};

export default async function bencher() {
  const bencherCommand = await new Command()
    .version("0.1.0")
    .name("bencher")
    .option("-r,--ref <ref:string>", "git ref of benchee", {
      required: true,
    })
    .option("-o,--output <output:string>", "output file")
    .description("benchmark a command")
    .parse(Deno.args);

  const options = bencherCommand.options;
  if (!options.ref) {
    console.error(
      'you must provide a "ref" which represents a version of the benchee',
    );
    Deno.exit(1);
  }

  const cwd = Deno.cwd();

  const [bencheePath, ...bencheeArgs] = bencherCommand.literal;

  console.log("benchmarking", cyan(`${bencheePath} ${bencheeArgs.join(" ")}`));
  performance.mark("benchee-start");

  const command = new Deno.Command(bencheePath, {
    args: bencheeArgs,
  });

  const output = await command.output();
  performance.mark("benchee-end");
  performance.measure("benchee", "benchee-start", "benchee-end");

  const entries = performance.getEntriesByName("benchee");

  const bencheeEntry: BencheeRecordEntry = {
    duration: entries[0].duration,
    ts: new Date().toISOString(),
    bencheeCommand: `${bencheePath} ${bencheeArgs.join(" ")}`,
    cwd,
  };

  const outputFilePath = options.output ?? path.join(cwd, "benchee.json");

  let existingRecordText = "{}";

  try {
    existingRecordText = await Deno.readTextFile(
      outputFilePath,
    );
  } catch (_e) {
    // benchee.json doesn't exist, we'll just create it
  }

  let existingRecord: BencheeRecord;

  try {
    existingRecord = JSON.parse(existingRecordText) as BencheeRecord;
  } catch (_e) {
    // benchee.json failed to parse, we'll just overwrite it
    existingRecord = {};
  }

  const existingEntries = existingRecord?.[options.ref] ?? [];
  const newEntries = [...existingEntries, bencheeEntry];

  const newRecord: BencheeRecord = {
    ...existingRecord,
    [options.ref]: newEntries,
  };

  Deno.writeTextFile(
    outputFilePath,
    JSON.stringify(newRecord, null, 2),
  );

  console.log("\n--- output from benchee ---\n");

  if (output.code !== 0) {
    console.error(new TextDecoder().decode(output.stderr));
    Deno.exit(output.code);
  }

  console.log(new TextDecoder().decode(output.stdout));
}
