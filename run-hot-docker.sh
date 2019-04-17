#!/bin/sh
# Runs LATE in a docker container, binding the src directory on the host (i.e.
# this machine) so that changes made to frontend files are reflected in the image.
if [ "$1" = "--build" ]
then
  docker build -t rcos/late .
  docker rmi -f $(docker images -q --filter "dangling=true")
fi
docker run -p 8080:8080 --mount type=bind,src="$(pwd)"/src,dst=/usr/src/app/src rcos/late
