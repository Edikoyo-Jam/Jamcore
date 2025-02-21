# Jamcore
Backend for a jam site

To run you can first set environment variables for the database in a .env file

```
POSTGRES_USER=jammer
POSTGRES_PASSWORD=INSERTPASSWORDHERE
POSTGRES_DB=jamcore
TOKEN_SECRET=RANDOMSTRINGHERE
```

And then run

if you are running Compose v2

(When running v2 make sure to remove `version: "3"` from the docker-compose.yml since it's deprecated in v2)

```
docker compose up --build -d
```
if you are running Compose v1.
> [!WARNING]
> if you are running v1 make sure to take a look at [v2 docs](https://docs.docker.com/compose/releases/migrate/)[^1]
```
docker-compose up --build -d
```

if you have docker and docker compose. This builds the docker image for the backend and then runs it (and also runs the database)

[^1]: The final Compose V1 release, version 1.29.2, was May 10, 2021. These packages haven't received any security updates since then. Use at your own risk.