# GitHub Docker Action

Build and publish your repository as a Docker image and push it to GitHub Package Registry in one easy step.

## Inputs

### `username`

**Required**. GitHub user to publish the image on behalf of.

### `personalAccessToken`

**Required**. GitHub Personal Access Token for the user. Must have write permissions for packages.

### `repositoryName`

Optional. The repository to push the image to. Defaults to current repository. Must be specified in format `user/repo`.

### `imageName`

Optional. The desired name for the image. Defaults to current repository name.

### `imageTag`

Optional. The desired tag for the image. Defaults to current branch or release version number.

## Outputs

### `imageURL`

The full URL of the image.

## Example usage

```yaml
- name: Publish Image
  uses: matootie/github-docker@v1.0.0
  with:
    username: matootie
    personalAccessToken: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
```
