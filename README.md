# JFLAP2Mentor

Convert [JFLAP](https://www.jflap.org) files (.jff) to UCSB's [Mentor](mentor-guide.pdf) format (.dfa, .nfa).

## Setup

Install the node packages by running:
```
cd JFLAP2Mentor
npm install -g
```

Note that the `-g` flag is optional but will automatically symlink the `j2m.js` code to the `j2m` command in your terminal.

## Arguments

[Required] `-i, --input`: The input file (.jff) or input directory (containing .jff files)

[Required] `-o, --output`: The output file or directory for Mentor format files

[Optional] `-s, --selector`: A RegEx-style input selector to specify files in an input directory

[Optional] `-f, --format`: The format of the output files (.dfa, .nfa) if a directory is used

[Optional] `-a, --alphabet`: The output alphabet to be used (concatenated with identified characters)

[Optional] `-e, --environment`: Set passed in arguments to the environment (to use as the default arguments)

[Optional] `-ep, --environment-print`: Print the current environment arguments
