#!/bin/bash
cd /opt/www/Ventu/Games/public/g/piggyrun/assets

limit=6
ls -t | tail --lines=+$(expr $limit + 1) | xargs -d '\n' rm