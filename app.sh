#!/bin/sh

basedir=`dirname "$0"`
$basedir/bin/node --harmony $basedir/app.js & wait
