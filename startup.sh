#!/bin/bash

counter = $1
while [$counter -ge 0]
  do
    pm2 start node --name r$counter -- racers.js rnumber=$counter
  done
echo "All the racers are ready to begin the race."

racers=$1 node master.js
echo "Master is ready to given the instruction."