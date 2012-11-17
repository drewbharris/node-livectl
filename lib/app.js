"use strict";

// THIS ISN'T USED NOW, IT DOESN'T WORK
// It's really nice and clean but doesn't work... so... gotta fix that.

var appjs = require('appjs'),
    when = require('when'),
    events = require('events'),
    util = require('util');


var App = function(){
    this.app = appjs;
};
util.inherits(App, events.EventEmitter);

App.prototype.init = function(){
    this.app.serveFilesFrom(__dirname + '/appjs/content');

    this.menubar = this.app.createMenu([{
        label:'&File',
        submenu:[{
            label:'&Exit',
            action: function(){
                this.window.close();
            }
        }]},
    {
        label:'&Tools',
        submenu:[{
            label:'&Developer Tools',
            action:function(item) {
                this.window.frame.openDevTools();
            }
        }]
    }]);

    this.trayMenu = this.app.createMenu([{
        label:'Show',
            action:function(){
            this.window.frame.show();
        }
    },{
        label:'Minimize',
        action:function(){
            this.window.frame.hide();
        }
    },{
        label:'Exit',
        action:function(){
            this.window.close();
        }
    }]);

    this.statusIcon = this.app.createStatusIcon({
        icon: __dirname + '/appjs/content/icons/32.png',
        tooltip: 'AppJS Hello World',
        menu: this.trayMenu
    });

    this.window = this.app.createWindow({
        width  : 800,
        height : 600,
        icons  : __dirname + '/appjs/content/icons'
    });

    this.window.on('create', function(){
        this.emit('create', {});
    });

    this.window.on('ready', function(){
        this.emit('ready', {});
    });

    this.window.on('close', function(){
        this.emit('close', {});
    });


};

var create = function(){
    return new App();
};

// window.on('ready', function(){

//   window.frame.show();
//   window.frame.center();
//   window.frame.setMenuBar(menubar);

//   console.log("Window Ready");
//   window.process = process;
//   window.module = module;

//   var $ = window.$;

//   $('#field').text('sup');

//   function Escape(e){
//     return e.keyCode === 27;
//   }

//   window.addEventListener('keydown', function(e){
//     if (new Escape(e)) {
//       window.frame.destroy();
//     }
//   });
// });



module.exports = {
    'App': App,
    'create': create
};
