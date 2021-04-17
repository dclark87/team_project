FROM tiangolo/meinheld-gunicorn-flask:python3.7
COPY ./app /app
WORKDIR /app/

# Install all Requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy our entire Application Directory to our Docker Container
EXPOSE 5000
EXPOSE 80

# Run the start script, it will start Gunicorn with Meinheld
CMD ["/app/start.sh"]