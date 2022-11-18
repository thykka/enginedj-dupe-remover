# Duplicate track remover for EngineDJ

If you've done the mistake of syncing your music library onto an SD card from more than one computer, it's likely that you might have ended up with duplicate tracks on your SD card. It's annoying, because cue markers and other metadata is not shared across the duplicates, not to mention all the disk space it wastes.

This script attempts to rectify the situation by removing duplicate tracks from the Collection *and* from the Music folder. A track is considered a duplicate when it's filename has a ` (2)` at the end, and if there is at least one other track with the same artist and title.

This detection logic is not perfect, but it got rid of over 3K duplicates for me, saving countless hours of manual editing. Hopefully it works for you as well.

## Important note

*Do* make a backup of your entire SD card before using this tool. The script does not back up anything. It's best to assume it might nuke the entire folder, so make sure to prepare accordingly.

## Requirements

- Close EngineDJ before running this script! Otherwise it may crash EngineDJ, or even corrupt your Collection database.

- Basic command line skills - Helps if you know how to navigate in a terminal. If you're on Windows, I strongly recommend [using WSL](https://learn.microsoft.com/en-us/windows/wsl/install).

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

## What does it actually do?

The cleaning script works by searching the Collection database for tracks with a filename ending in ` (2)`. If it finds one, it will then check if there's another track with the same artist and title. If it finds at least one duplicate, it then attempts to remove the file with ` (2)` from the database. If removing from database succeeds, it then attempts to remove the file itself.

If you've ended up in a situation where you have more than two copies of tracks, searching for ` (2)` might not be sufficient. In this case you might need to edit the script to search for ` (3)` instead.

Sometimes sqlite3 chokes when too many updates are carried out too fast. If this happens, you might have to try running it again. If that doesn't decrease the total duplicate count, [TODO: figure out a solution for this issue].
