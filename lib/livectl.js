"use strict";

var midi = require('midi'),
	when = require('when'),
	events = require('events'),
	util = require('util'),
	io = require('socket.io'),
	ioclient = require('socket.io-client'),
	mdns = require('mdns');

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
	io.listen(this.socketPort);
	io.sockets.on('connection', function(socket){
		// socket.on('midiEvent', function(data){
		// socket.broadcast.emit('midiEvent', data);
		// });
	});
	this.ad = mdns.createAdvertisement(new mdns.ServiceType('socket', 'tcp'), this.socketPort);
	this.ad.start();
};

LiveCtl.prototype.startClient = function(){
};

var create = function create(){
	return new LiveCtl();
};

module.exports = {
	'LiveCtl': LiveCtl,
	'create': create
};
