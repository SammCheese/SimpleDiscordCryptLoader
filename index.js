const { Plugin } = require('powercord/entities');
const https = require('https');
const fs = require('fs');
const path = require('path');

const cryptPath = path.join(__dirname, 'components', 'SimpleDiscordCrypt.user.js');

const download = function(url, path) {
  var file = fs.createWriteStream(path);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
    })
  });
};

function hasUpdates(input, input2) {
  var version;


  if (!fs.existsSync(input)) return true;

  https.get(input2, (res) => {
    res.on('data', (d) => {
      if (d.toString('utf-8').includes('// @version')) {
        version = d.toString('utf-8').split('// @version')[1].split('\n')[0];
        version = parseInt(version.split('.').join(""));
      }
      else return false;
    }).on('error', (e) => {
      console.error(e);
      return false;
    });
  });

  fs.readFile(input, 'utf8', (err, data) => {
    if (err) return true;
    if (data.includes('// @version')) {
      let currentVersion = data.split('// @version')[1].split('\n')[0];
      currentVersion = parseInt(currentVersion.split('.').join(""));
      return version > currentVersion;
    }
  });
}

module.exports = class SimpleDiscordCrypt extends Plugin {
  startPlugin() {
    if (hasUpdates(cryptPath, 'https://gitlab.com/An0/SimpleDiscordCrypt/raw/master/SimpleDiscordCrypt.meta.js')) {
      console.log('Updating SimpleDiscordCrypt');
      download('https://gitlab.com/An0/SimpleDiscordCrypt/raw/master/SimpleDiscordCrypt.user.js', cryptPath);
    }
    fs.readFile(cryptPath, 'utf8', (err, data) => {
      if (err) return;
      eval(data);
    });
  }

  pluginWillUnload() {
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
};
