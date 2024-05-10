# benchee

## Usage

The goal with bencher is to make it really easy to see how long a command takes
to run, and catalog that information.

```bash
bencher -r unoptimized-echo -- echo "hello world"
```

This will run `echo "hello world"` and store an entry in a file named
`benchee.json` in the current directory.

The result will look like this:

```jsonc
{
  "unoptimized-echo": { // the name of the ref
    "entries": [
      {
        "duration": 70.764292, // in milliseconds
        "ts": "2024-05-10T20:58:27.655Z",
        "bencheeCommand": "echo \"hello world\"",
        "cwd": "/Users/m/optimize-echo"
      },
      {
        "duration": 11.11291700000001,
        "ts": "2024-05-10T20:58:33.042Z",
        "bencheeCommand": "echo \"hello world\"",
        "cwd": "/Users/m/optimize-echo"
      },
      {
        "duration": 17.802250000000015,
        "ts": "2024-05-10T20:59:29.843Z",
        "bencheeCommand": "echo \"hello world\"",
        "cwd": "/Users/m/optimize-echo"
      }
    ],
    "summary": {
      "mean": 33.22648633333334,
      "median": 17.802250000000015,
      "min": 11.11291700000001,
      "max": 70.764292,
      "stddev": 26.683352296860374
    }
  }
}
```

In addition to the entries, we also compute a summary of the durations across
all entries for a given `ref`.

You can run a number of identical tests in one ref, then make a change and run
the same tests in another ref, and compare the summaries
