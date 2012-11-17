"use strict";

var app = module.exports = require('appjs'),
    live = require('./lib/livectl').create(),
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
    console.log('close');
});

window.on('ready', function(){

    var $ = window.$;

    window.frame.show();
    window.frame.center();
    window.frame.setMenuBar(menubar);

    console.log("Window Ready");
    window.process = process;
    window.module = module;

    $('#messages').text('hello');

    $('#list').click(function(){
        $('#midiDeviceList').text(JSON.stringify(live.listPorts()));
    });

    $('#startServer').click(function(){
        $('#messages').text('starting server');
        live.startServer();
    });

    $('#startClient').click(function(){
        $('#messages').text('starting client');
        live.startClient();
    });

    function Escape(e){
        return e.keyCode === 27;
    }

    window.addEventListener('keydown', function(e){
        if (new Escape(e)) {
            window.frame.destroy();
        }
    });
});

