# node-mpdsocket

`mpdsocket` is a node.js client for MPD. It is loosely based on (but aims to be more usable than) [robinduckett/node-mpd](https://www.github.com/robinduckett/node-mpd).

## Usage

### Example

	var mpdSocket = require('mpdsocket');
	var mpd = new mpdSocket('localhost','6600');
	
	mpd.on('connect',function() {
		mpd.send('status',function(r) {
			console.log(r);
		});
	});

### Functions
* `mpdSocket.on(event,fn)` adds event handlers to the net.Socket object directly.
* `mpdSocket.send(req,callback)` sends a request to MPD with a callback function.

## Return objects

`mpdsocket` parses the output from the [MPD protocol](http://www.musicpd.org/doc/protocol/) into a JavaScript object. This object has three meta-attributes that mpdsocket adds:

* `_OK` denotes that the request was completed successfully.
* `_error` is the error returned if `_OK` is false.
* `_ordered_list` denotes that the object is an ordered list (see section below).

### Ordered lists
Some MPD commands, like `listplaylists`, will return an ordered list of objects. The structure of these objects looks like this:

	{ '1':
		{ playlist: 'playlist-1',
		  'Last-Modified': '2011-03-19T06:39:44Z' },
	  '2':
		{ playlist: 'playlist-2',
		  'Last-Modified': '2011-03-19T06:41:08Z' },
	  _ordered_list: true,
	  _OK: true
	}
