"use strict";

var midi = require('midi'),
	when = require('when'),
	events = require('events'),
	util = require('util'),
	io = require('socket.io').listen(8080),
	ioclient = require('socket.io-client'),
	mdns = require('mdns'),
	os = require('os');

// @todo (dh) shouldn't have to define io's port up here

var LiveCtl = function(){
    this.socketPort = 8080;
    this.clients = [];
};
util.inherits(LiveCtl, events.EventEmitter);

// LiveCtl.prototype.listPorts = function(){
// 	var numberOfInputs = this.input.getPortCount(),
// 		numberOfOutputs = this.output.getPortCount(),
// 		ports = {
// 			'inputs': [],
// 			'outputs': []
// 		},
// 		i;

// 	for (i=0;i<numberOfInputs;i++) {
// 		ports.inputs[i] = this.input.getPortName(i);
// 	}
// 	for (i=0;i<numberOfOutputs;i++) {
// 		ports.outputs[i] = this.output.getPortName(i);
// 	}
// 	return ports;
// };

LiveCtl.prototype.startServer = function(){

	console.log('got here');
	var self = this,
		midiIn = new midi.input();

	// start mdns stuff
	if (this.ad === undefined){
		this.ad = mdns.createAdvertisement(new mdns.ServiceType('socket', 'tcp'), this.socketPort);
		this.ad.start();
	}

	io.sockets.on('connection', function(socket){
		self.clients.push(socket);
		socket.on('setName', function(data){
			socket.set('name', data.name, function(){
				self.emit('connection', {
					'name': data.name
				});
			});
		});
		socket.on('disconnect', function(){
			self.clients.splice(this.clients.indexOf(socket), 1);
			socket.get('name', function(err, name){
				self.emit('disconnection', {
					'name': name
				});
			});
		});
	});

	this.midiIn = midiIn.openPort(0);

	midiIn.on('message', function(deltaTime, message){
		self.sendToClients('midiEvent', {
			'message': message,
			'deltaTime': deltaTime
		});
	});
};

LiveCtl.prototype.stopServer = function(){
	this.ad.stop();
};

LiveCtl.prototype.startClient = function(){
	// start mdns stuff
	var self = this,
		midiOut = new midi.output();

	this.browser = mdns.createBrowser(new mdns.ServiceType('socket', 'tcp'));
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

	this.socket = ioclient.connect('http://'+service.addresses[0]+':'+service.port);
	this.socket.emit('setName', {
		'name': os.hostname()
	});

	this.socket.on('midiEvent', function(data){
		console.log(data.message);
		// this.midiOut.sendMessage(data.message);
	});
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
