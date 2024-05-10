<div align="center">
  <br>
  <h1>bencher</h1>
</div>
<br>
<p align="center">
  <a href="https://github.com/polyseam/bencher/actions/workflows/main-latest.yml">
    <img src="https://github.com/polyseam/bencher/actions/workflows/main-latest.yml/badge.svg" alt="main" style="max-width: 100%;">
  </a>
  <img src="https://img.shields.io/badge/Dependabot-active-brightgreen.svg" alt="Dependabot Badge">
  <img src="https://img.shields.io/github/languages/code-size/polyseam/bencher" alt="GitHub code size in bytes">
  <img src="https://img.shields.io/github/commit-activity/w/polyseam/bencher" alt="GitHub commit activity">
  <a href="https://github.com/polyseam/bencher/issues">
    <img src="https://img.shields.io/github/issues/polyseam/bencher" alt="GitHub issues">
  </a>
  <a href="https://cndi.run/bencher-releases?utm_content=gh_badge_bencher_releases&utm_campaign=bencher_readme&utm_source=github.com/polyseam/bencher&utm_medium=repo&utm_id=5099">
    <img src="https://img.shields.io/github/v/release/polyseam/bencher.svg?style=flat" alt="GitHub Release">
  </a>
  <a href="https://cndi.run/di?utm_content=gh_badge_bencher_discord&utm_campaign=bencher_readme&utm_source=github.com/polyseam/bencher&utm_medium=repo&utm_id=5101">
    <img src="https://img.shields.io/discord/956275914596040754.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2" alt="Discord">
  </a>
  <a href="https://cndi.run/tw?utm_content=gh_badge_bencher_twitter&utm_campaign=bencher_readme&utm_source=github.com/polyseam/bencher&utm_medium=repo&utm_id=5100">
    <img src="https://img.shields.io/twitter/follow/Polyseam?label=&style=social" alt="Twitter">
  </a>
</p>

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
