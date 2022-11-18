# Duplicate track remover for EngineDJ

If you've done the mistake of syncing your music library onto an SD card from more than one computer, it's likely that you might have ended up with duplicate tracks on your SD card. It's annoying, because cue markers and other metadata is not shared across the duplicates, not to mention all the disk space it wastes.

This script attempts to rectify the situation by removing duplicate tracks from the Collection *and* from the Music folder. A track is considered a duplicate when it's filename has a ` (2)` at the end, and if there is at least one other track with the same artist and title.

This detection logic is not perfect, but it got rid of over 3K duplicates for me, saving countless hours of manual editing. Hopefully it works for you as well.

## Important note

*Do* make a backup of your entire SD card before using this tool. The script does not back up anything. It's best to assume it might nuke the entire folder, so make sure to prepare accordingly.

## Requirements

- Basic command line skills - Helps if you know how to navigate in a terminal.

- Node.js v16.17.1 - Later versions might work too. Use [nvm](https://github.com/nvm-sh/nvm) if you don't have the right version installed.

- Mounted SD card - You'll need to know it's full path

## Usage

```sh
$ node index.js [options] libraryPath
```

## Options

- `--clean` Scan for duplicates and remove them

  - `--dry` Perform a dry run (with --clean)

- `--list` List all files in collection

- `--missing` List missing files in collection

## Examples

```sh
$ node index.js --clean /mnt/music/
```

```sh
$ node index.js --check /mnt/music/
```
