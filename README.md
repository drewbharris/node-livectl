# node-livectl

Peer-to-peer MIDI messaging over ~~socket.io~~ ~~websockets~~ UDP, all wrapped in a fancy AppJS wrapper, using mDNS/Bonjour for service advertising and discovery.

## Install

     Clone this repo.
     Download AppJS.  Copy app/data/bin to node-livectl/lib/appjs/.
     npm install
     npm start

## The Basics

Servers receive MIDI data.  Clients send their MIDI data to a server.

## To Do

	*socket.io -> UDP (way, way faster)
	*npm package into native Mac wrapper script