"use strict";

var app = module.exports = require('appjs'),
  midi = require('midi'),
  when = require('when');

app.serveFilesFrom(__dirname + '/content');

var menubar = app.createMenu([{
  label:'&File',
  submenu:[
    {
      label:'E&xit',
      action: function(){
        window.close();
      }
    }
  ]
},{
  label:'&Tools',
  submenu:[
      {
        label:'Developer Tools',
        action:function(item) {
          window.frame.openDevTools();
        }
      }
    ]
  }
]);

menubar.on('select',function(item){
  console.log("menu item "+item.label+" clicked");
});

var trayMenu = app.createMenu([{
  label:'Show',
  action:function(){
    window.frame.show();
  }
},{
  label:'Minimize',
  action:function(){
    window.frame.hide();
  }
},{
  label:'Exit',
  action:function(){
    window.close();
  }
}]);

var statusIcon = app.createStatusIcon({
  icon:'./data/content/icons/32.png',
  tooltip:'AppJS Hello World',
  menu:trayMenu
});

var window = app.createWindow({
  width  : 640,
  height : 460,
  icons  : __dirname + './content/icons'
});

window.on('create', function(){
  console.log("Window Created");
  var midiInput = new midi.input(),
    midiOutput = new midi.output();

  listPorts(midiInput, midiOutput);
});

window.on('ready', function(){
  window.frame.show();
  window.frame.center();
  window.frame.setMenuBar(menubar);
  console.log("Window Ready");
  window.process = process;
  window.module = module;

  var $ = window.$;

  $('#field').text('sup');

  function Escape(e){
    return e.keyCode === 27;
  }

  window.addEventListener('keydown', function(e){
    if (new Escape(e)) {
      window.frame.destroy();
    }
  });
});

window.on('close', function(){
  console.log("Window Closed");
});

function listPorts(input, output) {
  var d = when.defer(),
    numberOfInputs = input.getPortCount(),
    numberOfOutputs = output.getPortCount();
  console.log('Inputs:');
  for (var i=0;i<numberOfInputs;i++) {
    console.log(i + ': ' + input.getPortName(i));
  }
  console.log('Outputs:');
  for (i=0;i<numberOfOutputs;i++) {
    console.log(i + ': ' + output.getPortName(i));
  }
  d.resolve();
  return d.promise;
}
