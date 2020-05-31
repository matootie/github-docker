# GitHub Docker Action

Build and publish your repository as a Docker image and push it to GitHub Package Registry in one easy step.

## Inputs

### `access_token`

**Required**. GitHub Token for the user. Must have write permissions for packages. Recommended set up would be to use the provided GitHub Token for your repository; `${{ secrets.GITHUB_TOKEN }}`.

### `context`

*Optional*. Where should GitHub Docker find the Dockerfile? This is a path relative to the repository root. Defaults to `.`, meaning it will look for a `Dockerfile` in the root of the repository.

### `username`

*Optional*. GitHub user to publish the image on behalf of. Defaults to the user who triggered the action to run.

### `repository`

*Optional*. The repository to push the image to. Defaults to current repository. Must be specified in format `user/repo`.

### `image_name`

*Optional*. The desired name for the image. Defaults to current repository name.

### `tags`

*Required*. The desired tag for the image. Can you user multiples tags
```yaml
with:
  tags: |
    latest
    anothertag
```
### `buildArg`

*Optional*. Any additional build arguments to use when building the image.
```yaml
with:
  build_args: |
    THISISARG1=test
    THISISARG2=test
```

## Outputs

### `imageURL`

The full URL of the image.

## Simple usage

```yaml
- name: Checkout Repository
  uses: actions/checkout@v2
- name: Publish Image
  uses: matootie/github-docker@v2.2.2
  with:
    tags: latest
    access_token: ${{ secrets.GITHUB_TOKEN }}
```

