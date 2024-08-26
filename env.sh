#!/bin/sh
export CURRENT_IP=$(hostname -i)
export BROADCAST_IP=172.19.0.255
export PORT=19009
exec "$@"
