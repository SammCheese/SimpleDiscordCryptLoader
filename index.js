const { Plugin } = require('powercord/entities');
const { React } = require('powercord/webpack');
const https = require('https');
const fs = require('fs');
const path = require('path');

const { open: openModal, close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');

const cryptPath = path.join(__dirname, 'components', 'SimpleDiscordCrypt.user.js');

const download = function (url, path) {
  const file = fs.createWriteStream(path);
  const request = https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
    });
  });
};

async function hasUpdates (input, input2) {
  if (!fs.existsSync(input)) {
    console.log(`%c[SimpleDiscordCrypt]%c SimpleDiscordCrypt not found, Downloading now...`, 'color: #4CFFCF; font-weight: bold;', 'color: #ffffff;');
    download('https://gitlab.com/An0/SimpleDiscordCrypt/raw/master/SimpleDiscordCrypt.user.js', cryptPath);
    return true;
  };

  https.get(input2, (res) => {
    res.on('data', (d) => {
      if (d.toString('utf-8').includes('// @version')) {
        let version = d.toString('utf-8').split('// @version')[1].split('\n')[0];
        version = parseInt(version.split('.').join(''));
        fs.readFile(input, 'utf8', (err, data) => {
          if (err) return true;
          if (data.includes('// @version')) {
            let currentVersion = data.split('// @version')[1].split('\n')[0];
            currentVersion = parseInt(currentVersion.split('.').join(''));
            if (currentVersion < version) {
              console.log(`%c[SimpleDiscordCrypt]%c Update available: ${currentVersion} -> ${version}\n Downloading now...`, 'color: #4CFFCF; font-weight: bold;', 'color: #ffffff;');
              download('https://gitlab.com/An0/SimpleDiscordCrypt/raw/master/SimpleDiscordCrypt.user.js', cryptPath);
            }
          }
        });
      }
    }).on('error', (e) => {
      console.error(e);
      return false;
    });
  });
}

module.exports = class SimpleDiscordCrypt extends Plugin {
  async startPlugin () {
    await hasUpdates(cryptPath, 'https://gitlab.com/An0/SimpleDiscordCrypt/-/blob/master/SimpleDiscordCrypt.user.js').then(
      () => {
        fs.readFile(cryptPath, 'utf8', (err, data) => {
          if (err) return;
          eval(data);
        });
      }
    )
  }

  pluginWillUnload() {
    openModal(() => 
      React.createElement(Confirm, {
            header: 'Disabling SimpleDiscordCryptLoader requires a Restart to take effect',
            confirmText:'Restart',
            onConfirm: () => document.location.reload(),
            cancelText: 'Cancel',
            onCancel: closeModal
      })
    )
  }
};
