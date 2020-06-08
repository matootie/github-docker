#### Development

```bash
docker build -t github-actions-dev:latest . 
docker run --rm -ti -v $PWD:/github-actions github-actions-dev:latest bash
```

```bash
npm run package
```