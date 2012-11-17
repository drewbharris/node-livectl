"use strict";

var midi = require('midi'),
	when = require('when'),
	events = require('events'),
	util = require('util'),
	dgram = require('dgram'),
	mdns = require('mdns'),
	os = require('os');

var LiveCtl = function(){
    this.port = 48998;
    this.clients = [];
};
util.inherits(LiveCtl, events.EventEmitter);

LiveCtl.prototype.startServer = function(){

	var self = this,
		midiIn = new midi.input();

	// start mdns stuff
	// this.ad = mdns.createAdvertisement(new mdns.ServiceType('socket', 'tcp'), this.socketPort);
	// this.ad.start();

	console.log('gonna do stuff');

	var socket = dgram.createSocket('udp4');
	socket.on('listening', function () {
		var address = this.socket.address();
		console.log('UDP Server listening on ' + address.address + ":" + address.port);
	});
	socket.on('message', function (message, remote) {
		console.log(remote.address + ':' + remote.port +' - ' + message);
	});
	socket.bind(this.port, '0.0.0.0');

	console.log('FUCK THE WORLD');

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

	var self = this,
		message = new Buffer('connection');

	this.socket.send(message, 0, message.length,
		service.port, service.addresses[0],	function(err, bytes) {
			console.log('UDP message sent to ' + service.addresses[0] +':'+ service.port);
		});

	// this.socket = ioclient.connect('http://'+service.addresses[0]+':'+service.port);
	// this.socket.emit('setName', {
	// 	'name': os.hostname()
	// });

	// this.socket.on('midiEvent', function(data){
	// 	console.log(data.message);
	// 	// this.midiOut.sendMessage(data.message);
	// });
};

LiveCtl.prototype.sendToClients = function(messageName, message){
	this.clients.map(function(client){
		client.emit(messageName, message);
	});
};

var create = function create(){
	return new LiveCtl();
};

module.exports = {
	'LiveCtl': LiveCtl,
	'create': create
};
