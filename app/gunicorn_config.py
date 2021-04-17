from __future__ import print_function
import os
host = os.getenv("HOST", "0.0.0.0")
port = os.getenv("PORT", "80")
bind_env = os.getenv("BIND", None)
use_loglevel = os.getenv("LOG_LEVEL", "info")
if bind_env:
    use_bind = bind_env
else:
    use_bind = "{host}:{port}".format(host=host, port=port)
# Gunicorn config variables
loglevel = use_loglevel
workers = 2
bind = use_bind
keepalive = 3000
timeout = 3000

# For debugging and testing
log_data = {
    "loglevel": loglevel,
    "workers": workers,
    "bind": bind,
    # Additional, non-gunicorn variables
    "host": host,
    "port": port,
}