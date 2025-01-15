# Jamcore
Backend for a jam site

To run you can first set environment variables for the database in a .env file

```
POSTGRES_USER=jammer
POSTGRES_PASSWORD=INSERTPASSWORDHERE
POSTGRES_DB=jamcore
```

And then run

```
docker-compose up --build -d
```

if you have docker and docker compose. This builds the docker image for the backend and then runs it (and also runs the database)
