"use strict";

var app = module.exports = require('appjs'),
    Server = require('./lib/server'),
    Client = require('./lib/client'),
    server, client,
    when = require('when');

app.serveFilesFrom(__dirname + '/lib/appjs/content');

var menubar = app.createMenu([{
    label:'&File',
    submenu:[{
        label:'&Exit',
        action: function(){
            window.close();
        }
    }]},
{
    label:'&Tools',
    submenu:[{
        label:'&Developer Tools',
        action:function(item) {
            window.frame.openDevTools();
        }
    }]
}]);

var window = app.createWindow({
    width  : 800,
    height : 600,
    icons  : __dirname + '/lib/appjs/content/icons'
});

window.on('create', function(){
    console.log('create');
});

window.on('close', function(){
    if (server !== undefined){
        server.stop();
    }
});

window.on('ready', function(){

    // appjs init stuff

    var $ = window.$;

    window.frame.show();
    window.frame.center();
    window.frame.setMenuBar(menubar);
    window.process = process;
    window.module = module;
    function Escape(e){
        return e.keyCode === 27;
    }
    window.addEventListener('keydown', function(e){
        if (new Escape(e)) {
            window.frame.destroy();
        }
    });

    // real stuff

    $('#messages').text('hello');

    // $('#list').click(function(){
    //     $('#midiDeviceList').text(JSON.stringify(live.listPorts()));
    // });

    $('#startServer').click(function(){
        $('#messages').text('starting server');
        server = Server.create($);
        server.begin();
    });

    $('#startClient').click(function(){
        $('#messages').text('starting client');
        client = Client.create($);
        client.begin();
    });

});
