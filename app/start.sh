echo "Running start.sh"
echo "Configuring Gunicorn: gunicorn main -b :8080 --timeout 3000  --workers=2 --threads=2 --worker-connections=1000"
exec gunicorn main:app -b :80 --timeout 3000  --workers=2 --threads=2 --worker-connections=1000 --config="/app/gunicorn_config.py"