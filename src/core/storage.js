const path = require('path');
// const fs = require('fs/promises');
const fs = require('fs');
const { mergePatch } = require('../util/patch');

// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database(path.join(app.getPath('userData'), 'storage.db'));
// // console.log(db);
// db.serialize(function() {
//   db.run("CREATE TABLE IF NOT EXISTS logins(" +
//     "id INTEGER PRIMARY KEY AUTOINCREMENT," +
//     "uuid VARCHAR(90) NOT NULL," +
//     "title VARCHAR(40) NOT NULL," +
//     "createdAt DATETIME," +
//     "updatedAt DATETIME" +
//     ");"
//   );
// });
//
// db.run("INSERT INTO logins (uuid, title) VALUES ('somesomadadad', 'Some test title');", (err) => {
//   if (err) {
//     console.error(err.message);
//     return;
//   } else {
//     console.log('inserted');
//   }
// });
//
// db.all("SELECT * FROM logins;", (err, rows) => {
//   console.log(rows);
// });
//
// db.close();

module.exports = class Storage {
  constructor(storagePath) {
    this.storagePath = storagePath;
    this.filePath = path.join(this.storagePath, 'storage.json');
  }

  getData() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.filePath, 'utf8', (err, data) => {
        if (err) { reject(err); return; }
        resolve(JSON.parse(data));
      });
    });
  }

  set(data) {
    return new Promise((resolve, reject) => {
      const writeToStorage = (patchedData) => {
        if (!patchedData) {
          patchedData = data;
        }
        fs.writeFile(this.filePath, JSON.stringify(patchedData), 'utf8', (err) => {
          if (err) { reject(err); return; }
          resolve();
        });
      }
      this.getData().then((stored) => {
        const patched = mergePatch(stored, data);
        writeToStorage(patched);
      }, (err) => {
        writeToStorage();
      });
    });
  }
}
