#!/bin/bash
forever start -a -l forever.log -o wordsearchJS.out.log -e wordsearchJS.err.log app.js
#exit 0
