# node-livectl

Peer-to-peer MIDI messaging over ~~socket.io~~ ~~websockets~~ UDP, all wrapped in a fancy AppJS wrapper, using mDNS/Bonjour for service advertising and discovery.

## Install

Clone this repo.
Download AppJS.  Copy app/data/bin to node-livectl/lib/appjs/.
npm install
npm start

## Package

./package.sh

## The Basics

Servers receive MIDI data.  Clients send their MIDI data to a server.  Performance?  Poor.  I've tried this with socket.io, WebSockets and UDP and have had pretty terrible luck with each.  This is strange to me, as I've had pretty good real-time UDP communication luck with C++ and openFrameworks.  It may be a problem with the way I've written this application, but I'm not sure.

