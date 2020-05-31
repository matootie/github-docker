#### Development

```bash
docker pull docker.pkg.github.com/craftech-io/github-docker/github-docker:latest

docker run --rm -ti -v $PWD:/github-actions github-actions-dev:latest bash
```

```bash
npm run package
```