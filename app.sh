#!/bin/sh

basedir=`dirname "$0"`
$basedir/lib/appjs/bin/node --harmony $basedir/index.js & wait
