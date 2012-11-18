"use strict";

var midi = require('midi'),
	when = require('when'),
	events = require('events'),
	util = require('util'),
	dgram = require('dgram'),
	mdns = require('mdns'),
	os = require('os');

var LiveCtl = function(){
    this.port = 8080;
    this.clients = [];
};
util.inherits(LiveCtl, events.EventEmitter);

LiveCtl.prototype.startServer = function(){

	var self = this,
		midiIn = new midi.input(),
		clients = this.clients;

	this.socket = dgram.createSocket('udp4', function (message, remote) {
		clients.push({
			'address': remote.address,
			'port': remote.port
		});
		var msg = JSON.parse(message.toString('utf-8'));
		if (msg.id === 'setName'){
			self.emit('connection', {
				'name': msg.message
			});
		}
	});

	this.clients = clients;

	// start mdns stuff
	this.ad = mdns.createAdvertisement(new mdns.ServiceType('socket', 'udp'), this.port);
	this.ad.start();

	self = this;
	this.socket.on('listening', function () {
		var address = self.socket.address();
		console.log('UDP Server listening on ' + address.address + ":" + address.port);
	});
	// this.socket.on('message', );

	this.socket.bind(this.port);

	this.midiIn = midiIn.openPort(0);

	midiIn.on('message', function(deltaTime, message){
		self.sendToClients('midiEvent', {
			'message': message,
			'deltaTime': deltaTime
		});
	});
};

LiveCtl.prototype.stopServer = function(){
	if (this.ad !== undefined){
		this.ad.stop();
	}
	this.socket.close();
};

LiveCtl.prototype.startClient = function(){
	// start mdns stuff
	var self = this,
		midiOut = new midi.output();

	this.browser = mdns.createBrowser(new mdns.ServiceType('socket', 'udp'));
	this.browser.on('serviceUp', function(service) {
		self.emit('serviceUp', service);
	});
	this.browser.on('serviceDown', function(service) {
		self.emit('serviceDown', service);
	});
	this.browser.start();

	// midi stuff
	this.midiOut = midiOut.openPort(0);
};

LiveCtl.prototype.connect = function(service){

	var self = this;

	this.socket = dgram.createSocket('udp4');
	var message = new Buffer(JSON.stringify({
		'id': 'setName',
		'message': os.hostname()
	}));
	this.socket.send(message, 0, message.length,
		service.port, service.addresses[0],	function(err, bytes) {
			console.log('message sent');
		});

	this.socket.on('message', function(message, remote){
		console.log(message);
	});
};

LiveCtl.prototype.sendToClients = function(messageName, message){
	// this.clients.map(function(client){
	// 	client.emit(messageName, message);
	// });
	var self = this;
	Object.keys(this.clients).map(function(client){
		var msg = new Buffer(JSON.stringify({
			'id': messageName,
			'message': message
		}));
		self.socket.send(msg, 0, msg.length,
			client.port, client.address, function(err, bytes) {
				console.log('message sent');
			});
	});
};

var create = function create(){
	return new LiveCtl();
};

module.exports = {
	'LiveCtl': LiveCtl,
	'create': create
};
