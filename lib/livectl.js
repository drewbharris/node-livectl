"use strict";

var midi = require('midi'),
	when = require('when'),
	events = require('events'),
	util = require('util');

var LiveCtl = function(){
	this.input = new midi.input();
    this.output = new midi.output();
    console.log(this.input.getPortCount());
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

LiveCtl.prototype.something = function(){
	console.log(this.input.getPortCount());
};

var create = function create(){
	return new LiveCtl();
};

module.exports = {
	'LiveCtl': LiveCtl,
	'create': create
};
