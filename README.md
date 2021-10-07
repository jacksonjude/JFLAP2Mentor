# JFLAP2Mentor

Convert [JFLAP](https://www.jflap.org) files (.jff) to [Mentor](mentor-guide.pdf) format (.dfa, .nfa).

## Setup

Install the node packages by running:
```
cd JFLAP2Mentor
npm install -g
```

Note that the `-g` flag here will automatically link the `convert.js` code to the `j2m` command in your terminal. It can be excluded if you do not want the command to be symlinked.

## Arguments

`-i, --input`: The input file (.jff) or input directory (containing .jff files)

`-s, --selector`: A RegEx-style input selector to specify which files in an input directory will be used

`-o, --output`: The output file or directory for Mentor format files

`-f, --format`: The format of the output files (.dfa, .nfa) if a directory is used
