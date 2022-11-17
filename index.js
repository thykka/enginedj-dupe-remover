const tables = [
  'm.db',
  'hm.db',
  'sm.db',
  'stm.db'
];

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './Database2/' + tables[0]
  },
  useNullAsDefault: true
});

async function doit() {
  const tracks = await knex.select().table('Track').where('filename', 'like', '% (3).%').orderBy('path');
  tracks.forEach(async dupeTrack => {
    const versions = await knex.select().table('Track').where({
      'artist': dupeTrack.artist,
      'title': dupeTrack.title
    });
    if(versions.length) {
      dupeTrack.del()
    }
  })
}


doit()
