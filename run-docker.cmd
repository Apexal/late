:: Runs LATE in a docker container. This is meant for testing purposes,
:: not necessarily for development.
@echo off
IF "%1" == "-build" (
  docker build -t rcos/late .
  :: delete stale Docker images if they have not been deleted already
  docker rmi $(docker images -q --filter 'dangling=true')
)
docker run -it -p 3000:3000 rcos/late
:: delete the container we just killed
docker rm $(docker ps -aq --no-trunc)
