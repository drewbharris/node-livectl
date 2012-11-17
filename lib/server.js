"use strict";

var Live = require('./livectl');

var Server = function($){
	this.live = Live.create(),
	this.$ = $;
};

Server.prototype.begin = function(){

	var $ = this.$;

	console.log('starting server');
	this.live.startServer();
	console.log('done');

	$('#content').append('<div id="clientsList">'+
		'connected clients:</br></div>');
	this.live.on('connection', function(data){
		var name = formatClientName(data.name);
		$('#messages').text(name+' connected');
		$('#clientsList').append('<div id="'+name+'">'+
			name+'</div>');
	});
	this.live.on('disconnection', function(data){
		var name = formatClientName(data.name);
		$('#messages').text(name+' disconnected');
		$('#'+name).remove();
	});
};

Server.prototype.stop = function(){
	this.live.stopServer();
};

var create = function($){
	return new Server($);
};

function formatClientName(serviceName){
	return serviceName.replace(/.local/g, '').replace(/-/g, '');
}

module.exports = {
	'Server': Server,
	'create': create
};