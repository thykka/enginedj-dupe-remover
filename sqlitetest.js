const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('/mnt/d/Music/Engine Library/Database2/m.db');

console.log(db);

db.serialize(() => {
    db.each('SELECT * FROM Track', (err, row) => {
        if(err || !row) return console.error(err);
        console.log(row.path)
    });
});

db.close();