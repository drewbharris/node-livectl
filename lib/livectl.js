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
    this.servers = [];
    this.input = new midi.input();
    this.output = new midi.output();
};
util.inherits(LiveCtl, events.EventEmitter);

// SERVER STUFF

LiveCtl.prototype.startServer = function(){

	console.log('starting server');
	// start mdns stuff
	var self = this;

	this.ad = mdns.createAdvertisement(new mdns.ServiceType('socket', 'tcp'), this.port);
	this.ad.start();

	// midi stuff
	this.output.openVirtualPort('livectl output');

	this.socket = dgram.createSocket('udp4', function (message, remote) {
		var msg = JSON.parse(message.toString('utf-8'));
		console.log(msg);
		if (msg.id === 'setName'){
			self.emit('connection', {
				'name': msg.message
			});
		}
		if (msg.id === 'midiEvent'){
			self.output.sendMessage(msg.message);
		}
		if (msg.id === 'diconnect'){
			self.emit('disconnection', {
				'name': msg.message
			});
		}
	});
	this.socket.bind(this.port);

	console.log('server started');
};

LiveCtl.prototype.stopServer = function(){
	if (this.ad !== undefined){
		this.ad.stop();
	}
	this.socket.close();
};

// CLIENT STUFF

LiveCtl.prototype.startClient = function(){

	var self = this;

	// start mdns stuff
	this.browser = mdns.createBrowser(new mdns.ServiceType('socket', 'tcp'));
	this.browser.on('serviceUp', function(service) {
		self.emit('serviceUp', service);
	});
	this.browser.on('serviceDown', function(service) {
		self.emit('serviceDown', service);
	});
	this.browser.start();

	this.input.openVirtualPort('livectl input');
};

LiveCtl.prototype.connect = function(service){

	var self = this;

	this.socket = dgram.createSocket('udp4');

	this.servers.push({
		'address': service.addresses[0],
		'port': service.port
	});

	// this is the 'connection' message
	this.socket.on('listening', function(){
		var message = new Buffer(JSON.stringify({
			'id': 'setName',
			'message': os.hostname()
		}));
		self.socket.send(message, 0, message.length,
			service.port, service.addresses[0],	function(err, bytes) {
				console.log('connection message sent to '+service.addresses[0]+':'+service.port);
			});
	});
	this.socket.bind(this.port);

	this.input.on('message', function(deltaTime, message){
		self.sendToServers('midiEvent', message);
	});
};

LiveCtl.prototype.disconnect = function(){


	// why doesn't this work...


	var self = this,
		message = new Buffer(JSON.stringify({
		'id': 'disconnect',
		'message': os.hostname()
	})),
		d = when.defer();

	when.all(self.servers.map(function(server){
		var p = when.defer();
		self.socket.send(message, 0, message.length,
			server.port, server.address, function(err, bytes) {
				console.log('disconnect message sent to ' + server.address + ':' + server.port);
				p.resolve();
			});
		return p.promise;
	})).then(function(){
		self.socket.close();
		d.resolve();
	});

	return d.promise;
};

LiveCtl.prototype.sendToServers = function(messageName, message){
	var self = this;
	this.servers.map(function(server){
		var msg = new Buffer(JSON.stringify({
			'id': messageName,
			'message': message
		}));
		self.socket.send(msg, 0, msg.length,
			server.port, server.address, function(err, bytes) {
				console.log(message + ' sent to ' + server.address + ':' + server.port);
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
