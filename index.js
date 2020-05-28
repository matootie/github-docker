const process = require('process');
const path = require('path');
const url = require('url');
const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  try {
    /*
    Required data:
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

    Step 1. Log in to Docker.
    Step 2. Build the Docker image.
    Step 3. Push the Docker image.

    */

    // Set the workspace directory and context.
    const home = process.env['HOME'];
    const workspace = process.env['GITHUB_WORKSPACE'];
    const context = core.getInput('context', { required: true });
    const workdir = path.join(workspace, context);

    // Log in to Docker.
    let username = core.getInput('username', { required: false });
    if (!username) username = process.env['GITHUB_ACTOR'];
    const password = core.getInput('accessToken', { required: true });
    await exec.exec(
      `docker`,
      ['login', 'docker.pkg.github.com', '--username', username, '--password', password]);

    // Process the repository name.
    let repository = core.getInput('repositoryName', { required: false });
    if (!repository) repository = process.env['GITHUB_REPOSITORY'];
    repository = repository.toLowerCase();

    // Process the image name.
    let imageName = core.getInput('imageName', { required: false });
    const repoArray = repository.split('/');
    if (!imageName) imageName = repoArray[repoArray.length - 1];
    imageName = imageName.toLowerCase();
    
    const imageURL = `docker.pkg.github.com/${repository}/${imageName}:`
    
    
    // Process the build args
    let buildArg = [];
    const buildArgsRaw = core.getInput('buildArg', { require: false });
    if (buildArgsRaw) buildArg = buildArgsRaw.match(/\w+=\S+/g).flatMap(str => ["--build-arg", str]);


    let pushtags = [];
    const pushRaw = core.getInput('tags', { require: false });
    if (pushRaw) pushtags = pushRaw.match(/\w\S+/g).flatMap(str => ["--tags", (imageURL, str).join(':')]);    

    // Build the Docker image.
    await exec.exec(
      `docker`,
      ['build', ...pushtags, workdir, ...buildArg]);

    // Push the Docker image.
    await exec.exec(
      `docker`,
      ['push', ...pushtags]);

    // Output the image URL.
    core.setOutput('imageURL', imageURL);

    // Delete the Docker config.
    exec.exec(
      'rm',
      ['-v', `${home}/.docker/config.json`]);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
