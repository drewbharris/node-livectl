"use strict";

var midi = require('midi'),
	when = require('when'),
	events = require('events'),
	util = require('util'),
	WebSocket = require('ws'),
	http = require('http'),
	WebSocketServer = WebSocket.Server,
	mdns = require('mdns'),
	os = require('os');

// @todo (dh) shouldn't have to define io's port up here

var LiveCtl = function(){
    this.port = 8080;
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

	var self = this,
		midiIn = new midi.input();

	// start mdns stuff
	if (this.ad === undefined){
		this.ad = mdns.createAdvertisement(new mdns.ServiceType('socket', 'tcp'), this.port);
		this.ad.start();
	}

	console.log('starting websocket server');
	this.wss = new WebSocketServer({server: http.createServer().listen(this.port)});

	this.wss.on('connection', function(ws){
		console.log(ws);
		self.clients.push(ws);
		ws.on('message', function(data){
			var message = JSON.parse(data);
			console.log(message);
			if (message.id === 'setName'){
				self.emit('connection', {
					'name': message.message
				});
			}
		});
		ws.on('close', function(){
			self.clients.splice(this.clients.indexOf(this.ws), 1);
			// ws.get('name', function(err, name){
			// 	self.emit('disconnection', {
			// 		'name': name
			// 	});
			// });
		});
	});

	console.log('done');

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
	this.midiOut = midiOut;
	this.midiOut.openPort(0);
};

LiveCtl.prototype.connect = function(service){

	var self = this;

	this.ws = new WebSocket('ws://'+service.addresses[0]+':'+service.port);
	this.ws.on('open', function(){
		self.ws.send(JSON.stringify({
			'id': 'setName',
			'message': os.hostname()
		}));
	});


	this.ws.on('message', function(data){
		var message = JSON.parse(data);
		if (message.id === 'midiEvent'){
			console.log(message.message);
			self.midiOut.sendMessage(message.message);
		}
	});
};

LiveCtl.prototype.sendToClients = function(messageName, message){
	this.clients.map(function(client){
		client.send(JSON.stringify({
			'id': messageName,
			'message': message
		}));
	});
};

var create = function create(){
	return new LiveCtl();
};

module.exports = {
	'LiveCtl': LiveCtl,
	'create': create
};
