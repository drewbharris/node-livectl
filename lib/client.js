"use strict";

var Live = require('./livectl');

var Client = function($){
	this.live = Live.create(),
	this.$ = $;
};

Client.prototype.begin = function(){
	var $ = this.$;

	this.live.startClient();
	$('#content').append('<div id="servicesList"/>');

    this.live.on('serviceUp', function(service){
		var id = formatServiceName(service.host);
        console.log('service up');

        $('#servicesList').append('<div id="'+id+'">'+
			'name: '+service.name+'</br>'+
			'address: '+service.addresses[0]+'</br>'+
			'port: '+service.port+'</br>'+
			'<input type="button" id="'+id+'_connect" value="connect"/>');

        $('#'+id+'_connect').on('click', function(){
			console.log('hey');
        });
    });
    this.live.on('serviceDown', function(service){
        console.log('service down');
    });
};

var create = function($){
	return new Client($);
};

function formatServiceName(serviceName){
	return serviceName.replace(/-/g, '').replace(/\./g, '');
}

module.exports = {
	'Client': Client,
	'create': create
};