# JFLAP2Mentor

Convert [JFLAP](https://www.jflap.org) files (.jff) to [Mentor](mentor-guide.pdf) format (.dfa, .nfa).

## Setup

### Install

Install the node packages by running:
```
cd JFLAP2Mentor
npm install
```

### Alias Setup

Add an alias in your terminal profile (.zprofile, .zshrc, .bash_profile, .bashrc, etc) for quick use.

First, insert an alias assignment at the end of your profile:
```
alias j2m="/Users/jackson/JFLAP2Mentor/j2m"
```

Then, restart your terminal or run:
```
source ~/.zprofile
```

## Arguments

`-i, --input`: The input file (.jff) or input directory (containing .jff files)
`-s, --selector`: A RegEx-style input selector to specify which files in an input directory will be used
`-o, --output`: The output file or directory for Mentor format files
`-f, --format`: The format of the output files (.dfa, .nfa) if a directory is used
