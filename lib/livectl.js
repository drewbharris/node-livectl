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
	this.input = new midi.input();
    this.output = new midi.output();
    this.socketPort = 8080;
};
util.inherits(LiveCtl, events.EventEmitter);

LiveCtl.prototype.listPorts = function(){
	var numberOfInputs = this.input.getPortCount(),
		numberOfOutputs = this.output.getPortCount(),
		ports = {
			'inputs': [],
			'outputs': []
		},
		i;

	for (i=0;i<numberOfInputs;i++) {
		ports.inputs[i] = this.input.getPortName(i);
	}
	for (i=0;i<numberOfOutputs;i++) {
		ports.outputs[i] = this.output.getPortName(i);
	}
	return ports;
};

LiveCtl.prototype.startServer = function(){

	var self = this;

	// start mdns stuff
	if (this.ad === undefined){
		this.ad = mdns.createAdvertisement(new mdns.ServiceType('socket', 'tcp'), this.socketPort);
		this.ad.start();
	}

	io.sockets.on('connection', function(socket){

		socket.on('setName', function(data){
			socket.set('name', data.name, function(){
				self.emit('connection', {
					'name': data.name
				});
			});
		});

		socket.on('disconnect', function(){
			socket.get('name', function(err, name){
				self.emit('disconnection', {
					'name': name
				});
			});

		});
	});
};

LiveCtl.prototype.stopServer = function(){
	this.ad.stop();
};

LiveCtl.prototype.startClient = function(){
	// start mdns stuff
	var self = this;
	this.browser = mdns.createBrowser(new mdns.ServiceType('socket', 'tcp'));
	this.browser.on('serviceUp', function(service) {
		self.emit('serviceUp', service);
	});
	this.browser.on('serviceDown', function(service) {
		self.emit('serviceDown', service);
	});
	this.browser.start();
};

LiveCtl.prototype.connect = function(service){
	this.socket = ioclient.connect('http://'+service.addresses[0]+':'+service.port);
	this.socket.emit('setName', {
		'name': os.hostname()
	});
};

var create = function create(){
	return new LiveCtl();
};

module.exports = {
	'LiveCtl': LiveCtl,
	'create': create
};
