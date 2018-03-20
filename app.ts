import * as SpotifyWebHelper from 'spotify-web-helper';
import * as fs from 'fs';
import * as _ from 'lodash';

function loadBlacklist(filename): Array<String> {
  const data = fs.readFileSync(filename);

  return data
    .toString()
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      return (!_.isEmpty(line) &&
              line.startsWith('https://open.spotify.com/track/'));
    });
}

const helper = SpotifyWebHelper();
const blacklist = loadBlacklist('blacklist.txt');

helper.player.on('error', err => {
  console.log(err);
  if (err.message.match(/No user logged in/)) {
    console.log('user not logged in / client quit');
  } else {
    console.log('cannot start Spotify / spotify is not installed');
  }
});

helper.player.on('ready', () => {
  console.log('Helper ready');
});

helper.player.on('track-will-change', (_track) => {
  const track = {
    url: _track.track_resource.location.og,
    artist: _track.artist_resource.name,
    name: _track.track_resource.name,
    length: _track.length
  };
  
  console.log(`Track changed to '${track.artist} - ${track.name}'`);
  
  if (_.includes(blacklist, track.url)) {
    setTimeout(() => helper.player.seekTo(track.length), 100);
    console.log('^ Blacklisted track, skipping...');
  }
});