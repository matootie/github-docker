# GitHub Docker Action

Build and publish your repository as a Docker image and push it to GitHub Package Registry in one easy step.

## Inputs

### `accessToken`

**Required**. GitHub Token for the user. Must have write permissions for packages. Recommended set up would be to use the provided GitHub Token for your repository; `${{ secrets.GITHUB_TOKEN }}`.

### `username`

*Optional*. GitHub user to publish the image on behalf of. Defaults to the user who triggered the action to run.

### `repositoryName`

*Optional*. The repository to push the image to. Defaults to current repository. Must be specified in format `user/repo`.

### `imageName`

*Optional*. The desired name for the image. Defaults to current repository name.

### `imageTag`

*Optional*. The desired tag for the image. Defaults to current branch or release version number.

## Outputs

### `imageURL`

The full URL of the image.

## Example usage

```yaml
- name: Checkout Repository
  uses: actions/checkout@v2
- name: Publish Image
  uses: matootie/github-docker@v2.0.0
  with:
    accessToken: ${{ secrets.GITHUB_TOKEN }}
```
