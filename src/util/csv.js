const fs = require('fs');

function readFromFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {reject(err); return;}
      const rows = data.split('\n');
      const header = rows.shift().split(',');
      const result = rows.map((row) => {
        const cols = row.split(',').filter(col => col !== '');
        return cols.reduce((accumulator, value, idx) => {
          const key = header[idx].substring(1, header[idx].length - 1);
          value = value.substring(1, value.length - 1);
          return Object.assign({}, accumulator, {[key]: value});
        }, []);
      });
      resolve(result);
    });
  });
}

module.exports = {
  readFromFile
}
