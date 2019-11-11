const process = require('process');
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const exec = require('@actions/exec');

async function run() {
  try {
    /*
    Required data:
    - Docker version.
      - Optional
      - Defaults to 19.03.4
    - GitHub username.
      - Required
    - GitHub token.
      - Required
    - Repository name.
      - Optional
      - Defaults to current repository owner/repo
    - Image name.
      - Optional
      - Defaults to current repository name
    - Image tag.
      - Optional
      - Defaults to current branch / tag

    Step 1. Download docker binaries.
    Step 2. Extract binaries.
    Step 3. Run the Docker daemon.
    Step 4. Log in to Docker.
    Step 5. Build the Docker image.
    Step 6. Push the Docker image.

    */

    // Set the workspace directory.
    const workspace = process.env['GITHUB_WORKSPACE'];

    // Download and extract the desired Docker archive.
    const dockerVersion = core.getInput('dockerVersion', { required: true });
    const dockerArchive = await tc.downloadTool(
      `https://download.docker.com/linux/static/stable/x86_64/docker-${dockerVersion}.tgz`);
    const dockerDir = await tc.extractTar(dockerArchive, '/tmp/github-docker');

    // Run the Docker daemon and log in.
    const username = core.getInput('username', { required: true });
    const password = core.getInput('personalAccessToken', { required: true });
    await exec.exec('/tmp/github-docker/dockerd &');
    await exec.exec(
      '/tmp/github-docker/docker',
      ['login', 'docker.pkg.github.com', '--username', username, '--password', password]);

    // Process the repository name.
    const repository = core.getInput('repositoryName', { required: false });
    if (repository == null) repository = process.env['GITHUB_REPOSITORY'];

    // Process the image name.
    const imageName = core.getInput('imageName', { required: false });
    const repoArray = repository.split('/');
    if (imageName == null) imageName = repoArray[repoArray.length - 1];

    // Process the image tag.
    const imageTag = core.getInput('imageTag', { required: false });
    const ref = process.env['GITHUB_REF'];
    const refArray = ref.split('/');
    if (imageTag == null) imageTag = refArray[refArray.length - 1];

    // Build the Docker image.
    await exec.exec(
      '/tmp/github-docker/docker',
      ['build', '--tag', `docker.pkg.github.com/${repository}/${imageName}:${imageTag}`, workspace]);

    // Push the Docker image.
    await exec.exec(
      '/tmp/github-docker/docker',
      ['push', `docker.pkg.github.com/${repository}/${imageName}:${imageTag}`]);

    // Output the image URL.
    core.setOutput('imageURL', `docker.pkg.github.com/${repository}/${imageName}:${imageTag}`);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
