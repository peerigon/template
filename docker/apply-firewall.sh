#!/bin/sh
# Applies an outbound-only firewall to whichever network namespace this
# process runs in. Meant to run in a sidecar with `network_mode:
# service:<target>` and `cap_add: [NET_ADMIN]`, so the rules apply to the
# target container's namespace rather than to a namespace of its own.
#
# Effect: the target container can still be reached from the host (inbound
# traffic via a published port is unaffected - it's a different iptables
# path) and can still talk to other containers on its private network
# ranges (db, cache, auth provider, mail catcher, ...), but any outbound
# connection to a real internet host is dropped, regardless of what env
# vars/API base URLs the app is configured with.
set -eu

iptables -F OUTPUT

# Always allow loopback and replies to connections that came in from outside
# (e.g. the host hitting the published port).
iptables -A OUTPUT -o lo -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow traffic to private/container-network address ranges (RFC1918) so
# service-to-service calls within the compose stack keep working.
iptables -A OUTPUT -d 10.0.0.0/8 -j ACCEPT
iptables -A OUTPUT -d 172.16.0.0/12 -j ACCEPT
iptables -A OUTPUT -d 192.168.0.0/16 -j ACCEPT
iptables -A OUTPUT -d 127.0.0.0/8 -j ACCEPT

# Default-deny everything else outbound (real internet hosts).
iptables -P OUTPUT DROP

echo "firewall-applied"
