# node-livectl

Peer-to-peer MIDI messaging over socket.io.

## Install

     npm install
     ./livectl start // create a server
     ./livectl connect http://mylivectlserver.com // connect a client to a server

## The Basics

Interchangable MIDI clients patchable via a web interface.  A server is started, and clients are connected.  Each client presents its available inputs and outputs to the server, and the inputs and outputs are patched through via a web interface.  All of the message passing is done with a WebSocket, which opens up the possibility of web-based sample triggering, etc.

## Results

This was a pretty short project just to see how feasible MIDI over socket.io is - turns out, it's not, really.  Latency is really inconsistent, for whatever reason.  Unless I get some inspiration, this is likely as far as this project will get.

Feel free to fork and continue if you think you might have better results.