"use strict";

var Live = require('./livectl');

var Client = function($){
	this.live = Live.create(),
	this.$ = $;
	this.idMap = {};
};

Client.prototype.begin = function(){
	var $ = this.$,
		self = this;

	this.live.startClient();
	$('#content').append('<div id="servicesList"/>');

    this.live.on('serviceUp', function(service){
		var id = formatServiceName(service.name);
		self.idMap[service.name] = id;

        $('#servicesList').append('<div id="'+id+'">'+
			'name: '+service.name+'</br>'+
			'address: '+service.addresses[0]+'</br>'+
			'port: '+service.port+'</br>'+
			'<input type="button" id="'+id+'_connect" value="connect"/>'+
			'</div>');

        $('#'+id+'_connect').on('click', function(){
			self.live.connect(service);
        });
    });
    this.live.on('serviceDown', function(service){
		var id = self.idMap[service.name];
        $('#'+id).remove();
    });
};

var create = function($){
	return new Client($);
};

function formatServiceName(serviceName){
	return serviceName.replace(/’/g, '').replace(/ /g, '');
}

module.exports = {
	'Client': Client,
	'create': create
};