"use strict";

var Live = require('./livectl');

var Server = function($){
	this.live = Live.create();
};

Server.prototype.begin = function(){
	this.live.startServer();
};

var create = function($){
	return new Server($);
};

module.exports = {
	'Server': Server,
	'create': create
};