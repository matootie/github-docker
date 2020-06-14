const path = require("path");
const core = require("@actions/core");
const exec = require("@actions/exec");

async function run() {
  try {

    // Set the workspace directory and context.
    const context = path.join(
      process.env.GITHUB_WORKSPACE,
      core.getInput("context", { required: true }));
    const contextName = path.join(
      context,
      core.getInput("contextName", { required: false }));

    // Log in to Docker.
    const username = process.env.GITHUB_ACTOR;
    const password = core.getInput("accessToken", { required: true });
    await exec.exec(
      `docker`,
      ["login", "docker.pkg.github.com", "--username", username, "--password", password]);

    // Process the repository name.
    let repository = core.getInput("repository", { required: false });
    if (!repository) repository = process.env.GITHUB_REPOSITORY;
    repository = repository.toLowerCase();

    // Process the image name.
    let imageName = core.getInput("imageName", { required: false });
    if (!imageName) {
      const repoArray = repository.split("/");
      imageName = repoArray[repoArray.length - 1];
    }
    imageName = imageName.toLowerCase();

    // Generate an image URL.
    const imageURL = `docker.pkg.github.com/${repository}/${imageName}`;

    // Process the build arguments.
    let buildArgs = [];
    const buildArgsRaw = core.getInput("buildArgs", { require: false });
    if (buildArgsRaw) buildArgs = buildArgsRaw.match(/\w+=\S+/g).flatMap(str => ["--build-arg", str]);

    // Process the image tags.
    let tags = ["--tag", "latest"];
    const tagRaw = core.getInput("tag", { require: false });
    if (tagRaw) tags = tagRaw.match(/\w\S+/g).flatMap(str => ["--tag", `${imageURL}:${str}`]);

    // Build the Docker image(s).
    await exec.exec(
        `docker`,
        ["build", ...tags, ...buildArgs, "--file", contextName, context]);

    // Push the Docker image(s).
    let pushTags = tags.filter((item, index) => index % 2 === 1);
    for (let pushImage of pushTags) {
      await exec.exec(`docker`, ["push", pushImage]);
    }

    // Output the image URL.
    core.setOutput("imageURL", imageURL);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
