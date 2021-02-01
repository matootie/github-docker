# GitHub Docker Action

Build and publish your repository as a Docker image and push it to GitHub Container Registry in one easy step.

[![GitHub Release](https://img.shields.io/github/v/release/matootie/github-docker)](https://github.com/matootie/github-docker/releases/latest)

Before updating, view the [change logs](https://github.com/matootie/github-docker/releases). If you need help feel free to submit an issue.

## Table of Contents

- [**Inputs**](#inputs)
- [**Outputs**](#outputs)
- [**Examples**](#examples)
  - [Simple usage](#simple-minimal-usage)
  - [Custom tag](#publishing-using-custom-tag)
  - [Multiple tags](#publishing-using-several-tags)
  - [Build arguments](#publishing-using-build-arguments)
  - [Using output](#publishing-and-using-output)
  - [Custom context](#publishing-using-custom-context)

## Inputs

| Name                  | Requirement       | Description |
| --------------------- | ----------------- | ------------|
| `accessToken`        | **Required**       | GitHub Access Token to log in using. Must have write permissions for packages.
| `imageName`           | ***Optional***    | The desired name for the image. Defaults to current repository name.
| `tag`                 | ***Optional***    | The desired tag for the image. Defaults to `latest`. Optionally accepts multiple tags separated by newline. _See [example below](#publishing-using-several-tags)_.
| `buildArgs`           | ***Optional***    | Any additional build arguments to use when building the image, separated by newline. _See [example below](#publishing-using-build-arguments)_.
| `context`             | ***Optional***    | Where should GitHub Docker find the Dockerfile? This is a path relative to the repository root. Defaults to `.`, meaning it will look for a `Dockerfile` in the root of the repository. _See [example below](#publishing-using-custom-context)_.
| `contextName`         | ***Optional***    | What Dockerfile should GitHub Docker be using when building. Defaults to traditional `Dockerfile` name. _See [example below](#publishing-using-custom-context)_.

## Outputs

| With Parameter        | Description                                |
| --------------------- | ------------------------------------------ |
| `imageURL`            | The URL of the image, **without** the tag. |

## Examples

#### Simple, minimal usage...

```yaml
- name: Publish Image
  uses: matootie/ghcr@v4.0.0
  with:
    accessToken: ${{ secrets.GHCR_TOKEN }}
```

That's right this is all you need to get started with this action! Simply provide the GitHub access token and the defaults will go to work. An image following the repository name will be pushed to GitHub Container Registry under the repository owner, tagged with `latest`. The resulting URL is set as output for easy use in future steps!

For additional customizations, see further examples below. For more information on the output URL, see [this example](#publishing-and-using-output).

#### Publishing using custom tag...

```yaml
- name: Publish Image
  uses: matootie/ghcr@v4.0.0
  with:
    accessToken: ${{ secrets.GHCR_TOKEN }}
    tag: latest
```

In this example we specify a custom tag for the image. Remember to append the tag when using the outputted image URL in the workflow. See [this example](#publishing-and-using-output) for more details.

#### Publishing using several tags...

```yaml
- name: Publish Image
  uses: matootie/ghcr@v4.0.0
  with:
    accessToken: ${{ secrets.GHCR_TOKEN }}
    tag: |
      latest
      ${{ github.sha }}
```

In this example we publish the same image under two different tags.

#### Publishing using build arguments...

```yaml
- name: Publish Image
  uses: matootie/ghcr@v4.0.0
  with:
    accessToken: ${{ secrets.GHCR_TOKEN }}
    buildArgs: |
      ENVIRONMENT=test
      SOME_OTHER_ARG=yes
```

Using build arguments is easy, just set each one on its own individual line, similarly to how you would in a `.env` file.

#### Publishing and using output...

```yaml
- name: Publish Image
  uses: matootie/ghcr@v4.0.0
  id: publish
  with:
    accessToken: ${{ secrets.GHCR_TOKEN }}

- name: Print Image URL
  run: echo ${{ steps.publish.outputs.imageURL }}    
```

In this example you can see how easy it is to reference the image URL after publishing. If you are using a custom tag, you most likely are going to need to append the tag to the URL when using it in the workflow...

```yaml
- name: Publish Image
  uses: matootie/ghcr@v4.0.0
  id: publish
  with:
    accessToken: ${{ secrets.GHCR_TOKEN }}
    tag: ${{ github.sha }}

- name: Print Full Image URL
  run: echo ${{ stets.publish.outputs.imageURL }}:${{ github.sha }}
```

Otherwise, future steps will end up using the implicit tag `latest` for the image and not the customized tag.

#### Publishing using custom context...

```yaml
- name: Publish Image
  uses: matootie/ghcr@v4.0.0
  with:
    accessToken: ${{ secrets.GHCR_TOKEN }}  
    context: custom/context/dir/
    contextName: custom.Dockerfile
```

Here we see an example of how to provide additional context to find the right Dockerfile. `context` is used to specify the directory of the Dockerfile, and `contextName` is used if the name of the Dockerfile is something that different than what `docker build .` would find by default.
