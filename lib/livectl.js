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
    this.input = new midi.input();
    this.output = new midi.output();
};
util.inherits(LiveCtl, events.EventEmitter);

LiveCtl.prototype.startServer = function(){

	var self = this,
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

	this.input.openPort(0);

	this.input.on('message', function(deltaTime, message){
		self.sendToClients('midiEvent', message);
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
	var self = this;

	this.browser = mdns.createBrowser(new mdns.ServiceType('socket', 'udp'));
	this.browser.on('serviceUp', function(service) {
		self.emit('serviceUp', service);
	});
	this.browser.on('serviceDown', function(service) {
		self.emit('serviceDown', service);
	});
	this.browser.start();

	// midi stuff
	this.output.openPort(0);
};

LiveCtl.prototype.connect = function(service){

	var self = this;

	this.socket = dgram.createSocket('udp4', function(message, remote){
		var msg = JSON.parse(message.toString('utf-8'));
		if (msg.id === 'midiEvent'){
			self.output.sendMessage(msg.message);
		}
	});

	this.socket.on('listening', function(){
		console.log('client listening');
		var message = new Buffer(JSON.stringify({
			'id': 'setName',
			'message': os.hostname()
		}));
		self.socket.send(message, 0, message.length,
			service.port, service.addresses[0],	function(err, bytes) {
				console.log('message sent');
			});
	});

	this.socket.bind(this.port);


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
			self.clients[client].port, self.clients[client].address, function(err, bytes) {
				console.log('message sent to ' + client.address + ':' + client.port);
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
