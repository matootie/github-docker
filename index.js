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
    let dockerfile = core.getInput('dockerfile', { required: false });
    if (!dockerfile) dockerfile = "Dockerfile"

    // Set the workspace directory and context.
    const workspace = process.env['GITHUB_WORKSPACE'];
    const context = core.getInput('context', { required: true });
    const workdir = path.join(workspace, context);

    // Log in to Docker.
    let username = core.getInput('username', { required: false });
    if (!username) username = process.env['GITHUB_ACTOR'];
    const password = core.getInput('access_token', { required: true });
    await exec.exec(
      `docker`,
      ['login', 'docker.pkg.github.com', '--username', username, '--password', password]);

    // Process the repository name.
    let repository = core.getInput('repository', { required: false });
    if (!repository) repository = process.env['GITHUB_REPOSITORY'];
    repository = repository.toLowerCase();

    // Process the image name.
    let imageName = core.getInput('image_name', { required: false });
    const repoArray = repository.split('/');
    if (!imageName) imageName = repoArray[repoArray.length - 1];
    imageName = imageName.toLowerCase();
    
    const imageURL = `docker.pkg.github.com/${repository}/${imageName}`
    
    
    // Process the build args
    let buildArg = [];
    const buildArgsRaw = core.getInput('build_args', { require: false });
    if (buildArgsRaw) buildArg = buildArgsRaw.match(/\w+=\S+/g).flatMap(str => ["--build-arg", str]);

    var join = function() {
      var args = Array.prototype.slice.call(arguments);
      return args.join(":");
    }

    let buildtags = [];
    const buildRaw = core.getInput('tags', { require: false });
    if (buildRaw) buildtags = buildRaw.match(/\w\S+/g).flatMap(str => ["--tag", join(imageURL, str)]);   
 

    // Build the Docker image.
    
    await exec.exec(
        `docker`,
        ['build', ...buildtags, "--file", dockerfile, workdir, ...buildArg]);
        
    // Push the Docker image.
    let pushtags = [];
    const pushRaw = core.getInput('tags', { require: false });
    if (pushRaw) pushtags = pushRaw.match(/\w\S+/g).flatMap(str => [join(imageURL, str)]);

    for (let pushImage of pushtags) {
      await exec.exec(
      `docker`,
      ['push', pushImage]);
    }
    // Output the image URL.
    core.setOutput('imageURL', imageURL);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
