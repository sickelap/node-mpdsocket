var net = require('net');
var sys = require('sys');

function mpdSocket(host,port) {
	if (!host) { 
		this.host = "localhost";
	} else {
		this.host = host;
	}

	if (!port){
		this.port = 6600;
	} else {
		this.port = port;
	}

	this.open(host,port);
}

mpdSocket.prototype = {
	callbacks: [],
	isOpen: false,
	socket: null,
	version: "0",
	host: null,
	port: null,

	handleData: function(data) {
		var response = new Object;
		var lines = data.split("\n");
		var i = 0;
		for (var l in lines) {
			if (lines[l].match(/^ACK/)) {
				response._error = lines[l].substr(10);
				response._OK = false;
				this.callbacks.shift()(response)
				return;
			} else if (lines[l].match(/^OK MPD/)) {
				this.version = lines[l].split(' ')[2];
				return;
			} else if (lines[l].match(/^OK/)) {
				response._OK = true;
				this.callbacks.shift()(response);
				return;
			} else {
				var attr = lines[l].substr(0,lines[l].indexOf(":"));
				var value = lines[l].substr((lines[l].indexOf(":"))+1);
				value = value.replace(/^\s+|\s+$/g, ''); // trim whitespace
				if (!(response._ordered_list)) {
					if (typeof(response[attr]) != 'undefined' || attr == "playlist" || attr == "file" || attr == "directory") {
						//make ordered list
						var tempResponse = { 1: {} };
						tempResponse[++i] = response;
						response = tempResponse;
						response._ordered_list = true;
						response[++i] = new Object;
						response[i][attr] = value;
					} else {
						response[attr] = value;
					}
				} else {
					if (typeof(response[i][attr]) != 'undefined' || attr == "playlist" || attr == "file" || attr == "directory") {
						response[++i] = new Object;
						response[i][attr] = value;
					} else {
						response[i][attr] = value;
					}
				}
			}
		}
	},
	
	on: function(event, fn) {
		this.socket.on(event,fn);
	},
		
	open: function(host,port) {
		var self = this;
		if (!(this.isOpen)) {
			this.socket = net.createConnection(port,host);
			this.socket.setEncoding('UTF-8');
			this.socket.addListener('connect',function() { self.isOpen = true; });
			this.socket.addListener('data',function(data) { self.handleData.call(self,data); });
			this.socket.addListener('end',function() { self.isOpen = false; });
		}
	},

	send: function(req,callback) {
		if (this.isOpen) {
			this.callbacks.push(callback);
			this.socket.write(req + "\n");
		} else {
			this.open(this.host,this.port);
			this.on('connect',function() {
				this.send(req,callback);
			});
		}
	}
}

module.exports = mpdSocket;
