#!/bin/bash

basedir="./";

TARDIR="./dist"

mkdir -p ${TARDIR};
cp -Rpa ${TARDIR}/AppBundle.skel.app ${TARDIR}/livectl.app;
cp -Rpa ${basedir}/lib/appjs/bin ${TARDIR}/livectl.app/Contents/MacOS/;
cp -Rpa ${basedir}/node_modules ${TARDIR}/livectl.app/Contents/Resources/;
cp -Rpa ${basedir}/lib/appjs/content ${TARDIR}/livectl.app/Contents/Resources/;
cp -Rpa ${basedir}/lib ${TARDIR}/livectl.app/Contents/Resources/;
cp -Rpa ${basedir}/index.js ${TARDIR}/livectl.app/Contents/Resources/app.js;
