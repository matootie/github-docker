# GitHub Docker Action

Build and publish your repository as a Docker image and push it to GitHub Package Registry or GitHub Container Registry in one easy step.

[![GitHub Release](https://img.shields.io/github/v/release/matootie/github-docker)](https://github.com/matootie/github-docker/releases/latest)

For help updating, view the [change logs](https://github.com/matootie/github-docker/releases). If you need additional help feel free to submit an issue.

## Table of Contents

- [**Inputs**](#inputs)
- [**Outputs**](#outputs)
- [**GitHub Package Registry**](#github-package-registry-usage)
  - [Simple usage](#simple-minimal-usage)
  - [Custom tag](#publishing-using-custom-tag)
  - [Multiple tags](#publishing-using-several-tags)
  - [Build arguments](#publishing-using-build-arguments)
  - [Using output](#publishing-and-using-output)
  - [Custom context](#publishing-using-custom-context)
  - [Publishing to a different repository](#publishing-to-a-different-repository)
- [**GitHub Container Registry**](#github-container-registry-usage)
  - [Simple usage](#simple-minimal-usage-1)
  - [Custom tag](#publishing-using-custom-tag-1)
  - [Multiple tags](#publishing-using-several-tags-1)
  - [Build arguments](#publishing-using-build-arguments-1)
  - [Using output](#publishing-and-using-output-1)
  - [Custom context](#publishing-using-custom-context-1)

## Inputs

| Name                  | Requirement       | Description |
| --------------------- | ----------------- | ------------|
| `accessToken`        | **Required**       | GitHub Access Token to log in using. Must have write permissions for packages. Recommended set up would be to use the provided GitHub Token for your repository; `${{ github.token }}`.
| `imageName`           | ***Optional***    | The desired name for the image. Defaults to current repository name.
| `tag`                 | ***Optional***    | The desired tag for the image. Defaults to `latest`. Optionally accepts multiple tags separated by newline. _See [example below](#publishing-using-several-tags)_.
| `buildArgs`           | ***Optional***    | Any additional build arguments to use when building the image, separated by newline. _See [example below](#publishing-using-build-arguments)_.
| `context`             | ***Optional***    | Where should GitHub Docker find the Dockerfile? This is a path relative to the repository root. Defaults to `.`, meaning it will look for a `Dockerfile` in the root of the repository. _See [example below](#publishing-using-custom-context)_.
| `contextName`         | ***Optional***    | What Dockerfile should GitHub Docker be using when building. Defaults to traditional `Dockerfile` name. _See [example below](#publishing-using-custom-context)_.
| `containerRegistry`   | ***Optional***    | Whether or not to push to GitHub Container Registry instead of GitHub Package Registry. _When using GitHub Container Registry there are a few important differences to keep in mind. See [explanation below](#github-container-registry-usage)_.
| `repository`          | ***Optional***    | The repository to push the image to. Defaults to the current repository. Must be specified in format `user/repo`. _Note: Using an external repository requires elevated permissions. The provided GitHub token for the repository running the action will **not** suffice. You must use custom secret containing a [Personal Access Token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) that has package write permissions on the given repository. See [example below](#publishing-to-a-different-repository)_.

## Outputs

| With Parameter        | Description                                |
| --------------------- | ------------------------------------------ |
| `imageURL`            | The URL of the image, **without** the tag. |

## GitHub Package Registry usage

#### Simple, minimal usage...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  with:
    accessToken: ${{ github.token }}
```

That's right this is all you need to get started with GitHub Docker, simply provide the GitHub token and the defaults will go to work. An image following the repository name will be pushed to the repository, tagged with `latest`. The resulting URL is set as output for easy use in future steps!

For additional customizations, see further examples below. For more information on the output URL, see [this example](#publishing-and-using-output).

#### Publishing using custom tag...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  with:
    accessToken: ${{ github.token }}
    tag: latest
```

In this example we specify a custom tag for the image. Remember to append the tag when using the outputted image URL in the workflow. See [this example](#publishing-and-using-output) for more details.

#### Publishing using several tags...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  with:
    accessToken: ${{ github.token }}
    tag: |
      latest
      ${{ github.sha }}
```

In this example we publish the same image under two different tags.

#### Publishing using build arguments...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  with:
    accessToken: ${{ github.token }}
    buildArgs: |
      ENVIRONMENT=test
      SOME_OTHER_ARG=yes
```

Using build arguments is easy, just set each one on its own individual line, similarly to how you would in a `.env` file.

#### Publishing and using output...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  id: publish
  with:
    accessToken: ${{ github.token }}

- name: Print Image URL
  run: echo ${{ steps.publish.outputs.imageURL }}    
```

In this example you can see how easy it is to reference the image URL after publishing. If you are using a custom tag, you most likely are going to need to append the tag to the URL when using it in the workflow...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  id: publish
  with:
    accessToken: ${{ github.token }}
    tag: ${{ github.sha }}

- name: Print Full Image URL
  run: echo ${{ stets.publish.outputs.imageURL }}:${{ github.sha }}
```

Otherwise, future steps will end up using the literal tag `latest` for the image and not the customized tag.

#### Publishing using custom context...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  with:
    accessToken: ${{ github.token }}  
    context: custom/context/dir/
    contextName: custom.Dockerfile
```

Here we see an example where GitHub Docker is given additional context on how to find the right Dockerfile. `context` is used to specify the directory of the Dockerfile, and `contextName` is used if the name of the Dockerfile is something that different than what `docker build .` would find.

#### Publishing to a different repository.

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  with:
    accessToken: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
    repository: my-user/my-repo
```

In this example we're pushing the resulting image to be listed under a separate repository, different from the one that this action is running on. Remember, in this case the provided `${{ github.token }}` will **not** work as it only has the necessary permissions for its own repository. You need to save a GitHub [Personal Access Token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) with write permissions to packages as a secret, and use that.

## GitHub Container Registry usage

Using GitHub Docker with the GitHub Container Registry is just about the same as using it with the Package Registry, but there are a few things to remember.

1. The `accessToken` input must be a [Personal Access Token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) with `write:packages` scope.
2. The `repositoryName` input is entirely useless as the container will be pushed to the owner of the current repository instead.

The following are a copy of the same examples listed above, using GitHub Container Registry instead of GitHub Package Registry. _Note the differences in input_.

#### Simple, minimal usage...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  with:
    accessToken: ${{ secrets.PAT }}
    containerRegistry: true
```

That's right this is all you need to get started with GitHub Docker, simply provide the GitHub token and the defaults will go to work. An image following the repository name will be pushed to the repository owner, tagged with `latest`. The resulting URL is set as output for easy use in future steps!

For additional customizations, see further examples below. For more information on the output URL, see [this example](#publishing-and-using-output-1).

#### Publishing using custom tag...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  with:
    accessToken: ${{ secrets.PAT }}
    tag: latest
    containerRegistry: true
```

In this example we specify a custom tag for the image. Remember to append the tag when using the outputted image URL in the workflow. See [this example](#publishing-and-using-output-1) for more details.

#### Publishing using several tags...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  with:
    accessToken: ${{ secrets.PAT }}
    tag: |
      latest
      ${{ github.sha }}
    containerRegistry: true
```

In this example we publish the same image under two different tags.

#### Publishing using build arguments...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  with:
    accessToken: ${{ secrets.PAT }}
    buildArgs: |
      ENVIRONMENT=test
      SOME_OTHER_ARG=yes
    containerRegistry: true
```

Using build arguments is easy, just set each one on its own individual line, similarly to how you would in a `.env` file.

#### Publishing and using output...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  id: publish
  with:
    accessToken: ${{ secrets.PAT }}
    containerRegistry: true

- name: Print Image URL
  run: echo ${{ steps.publish.outputs.imageURL }}    
```

In this example you can see how easy it is to reference the image URL after publishing. If you are using a custom tag, you most likely are going to need to append the tag to the URL when using it in the workflow...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  id: publish
  with:
    accessToken: ${{ secrets.PAT }}
    tag: ${{ github.sha }}
    containerRegistry: true

- name: Print Full Image URL
  run: echo ${{ stets.publish.outputs.imageURL }}:${{ github.sha }}
```

Otherwise, future steps will end up using the literal tag `latest` for the image and not the customized tag.

#### Publishing using custom context...

```yaml
- name: Publish Image
  uses: matootie/github-docker@v3.1.0
  with:
    accessToken: ${{ secrets.PAT }}  
    context: custom/context/dir/
    contextName: custom.Dockerfile
    containerRegistry: true
```

Here we see an example where GitHub Docker is given additional context on how to find the right Dockerfile. `context` is used to specify the directory of the Dockerfile, and `contextName` is used if the name of the Dockerfile is something that different than what `docker build .` would find.
