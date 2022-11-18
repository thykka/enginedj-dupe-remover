/*

Usage:

$ node index.js [options] libraryPath

Options:

--clean - Scan for duplicates and remove them
--dry   - Perform a dry run (with --clean)

--list  - List all files in collection

--missing - List missing files in collection

Examples:

$ node index.js --list --check /mnt/music/

$ node index.js --clean /mnt/music/

*/

const Knex = require('knex');
const { join: pathJoin } = require('path');
const { statSync, unlinkSync } = require('fs');
const statOptions = { throwIfNoEntry: false };



const Tables = [
  'm.db',
  //'hm.db',
  //'sm.db',
  //'stm.db'
];

main();


async function main() {
  const { flags, dbPath, filesPath } = processArgs(process.argv);

  const knexes = Tables.map(table => {
    return Knex({
      client: 'sqlite3',
      connection: {
        filename: pathJoin(dbPath, table)
      },
      pool: {
        min: 1,
        max: 1
      },
      useNullAsDefault: true
    })
  });

  if(flags.list || flags.missing) {
    listAll({ flags, knexes, filesPath });
  } else if(flags.clean) {
    doit({ flags, knexes, filesPath });
  }
  //process.exit(0);
}

function processArgs(processArgv) {
  const [nodePath, scriptPath, ...args] = processArgv;
  const flags = Object.fromEntries(
    args.filter(arg => arg.startsWith('--')).map(flag => [flag.substring(2), true])
  );
  const selectedPath = args.filter(arg => !arg.startsWith('--')).pop()
  if(!selectedPath) {
    throw new Error('expected a target path');
  }
  const dbPath = pathJoin(selectedPath, '/Database2/');
  const filesPath = pathJoin(selectedPath);
  const stat = statSync(dbPath, statOptions);
  if(!stat) {
    throw new Error('invalid path: ' + dbPath);
  }
  
  console.log(`Running in ${ flags.dry ? 'dry' : 'wet' } mode at ${ dbPath }`);
  return {
    flags, dbPath, filesPath
  };
}

function listAll({ flags, knexes, filesPath }) {
  knexes.forEach(async knex => {
    console.log(`Listing tracks from ${ knex.context.client.config.connection.filename }...`);
    const tracks = await knex.select().table('Track').orderBy('path');
    if(flags.missing) {
      const missingTracks = tracks.filter(track => {
        const fileStat = statSync(pathJoin(filesPath, track.path), statOptions);
        return !fileStat;
      })
      if(missingTracks.length) {
        missingTracks.forEach(track => console.log(pathJoin(filesPath, track.path)));
      } else {
        console.log('No missing tracks detected.');
      }
    } else {
      tracks.forEach(track => console.log(track.path));
    }
  });
}

function doit({ flags, knexes, filesPath }) {
  knexes.forEach(async knex => {
    console.log(`Processing ${knex.context.client.config.connection.filename}...`);
    const tracks = await knex.select().table('Track').where('filename', 'like', '% (2).%').orderBy('path');
    console.log(`Found ${ tracks.length } possible dupes`);
    let counter = 0;
    tracks.forEach(dupeTrack => {
      counter++;
      const versions = knex.select().table('Track').where({
        'artist': dupeTrack.artist,
        'title': dupeTrack.title
      }).then(versions => {
        if(versions.length <= 1) return console.log('Not removing only version of ' + dupeTrack.path);

        const filePath = pathJoin(filesPath, dupeTrack.path);
        const fileStat = statSync(filePath, statOptions);
        if(!fileStat) {
          console.warn(`! missing track file: ${ filePath }`);
        } else {
          console.log(`${ flags.dry ? 'dry ' : '' }removing ${ dupeTrack.path } with ${ versions.length } versions...`);
        }
        if(fileStat && !flags.dry) {
          const deleted = knex.select().table('Track').where({
            id: dupeTrack.id
          }).del().then(deleted => {
            console.log({deleted})

            if(deleted > 0) {
              unlinkSync(filePath);
            } else {
              console.warn(`! Failed to remove track from DB: ${ dupeTrack.path }`);
            }
          });
        }
      });
    })
  });
  console.log('all done');
}
