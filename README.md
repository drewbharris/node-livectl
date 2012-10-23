# node-livectl

Peer-to-peer MIDI messaging over socket.io.

## Install

     npm install
     ./livectl start // create a server
     ./livectl connect http://mylivectlserver.com // connect a client to a server

## The Basics

Interchangable MIDI clients patchable via a web interface.  A server is started, and clients are connected.  Each client presents its available inputs and outputs to the server, and the inputs and outputs are patched through via a web interface.  All of the message passing is done with a WebSocket, which opens up the possibility of web-based sample triggering, etc.