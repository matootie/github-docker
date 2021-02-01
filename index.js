const path = require("path");
const core = require("@actions/core");
const exec = require("@actions/exec");

async function run() {
  try {

    /* =========================================================================
        GRAB ALL RAW INPUT
    ========================================================================= */

    const accessTokenRaw = core.getInput("accessToken", { required: true });
    const imageNameRaw = core.getInput("imageName", { required: false });
    const tagRaw = core.getInput("tag", { required: false });
    const buildArgsRaw = core.getInput("buildArgs", { required: false });
    const contextRaw = core.getInput("context", { required: true });
    const contextNameRaw = core.getInput("contextName", { required: false });

    /* =========================================================================
        SET ALL DEFAULTS
    ========================================================================= */

    // String together the context.
    const context = path.join(
      process.env.GITHUB_WORKSPACE,
      contextRaw
    );

    // String together the context name from the context.
    const contextName = path.join(
      context,
      contextNameRaw
    );

    // The access token is as-is.
    const accessToken = accessTokenRaw;

    // Get the optional repository name.
    repository = process.env.GITHUB_REPOSITORY.toLowerCase();

    // Set some throwaway values.
    const repoArray = repository.split("/");

    // Process the image name.
    let imageName = imageNameRaw;
    if (!imageName) {
      imageName = repoArray[repoArray.length - 1];
    }
    imageName = imageName.toLowerCase();

    // Process the owner name.
    const ownerName = repoArray[0];

    // Process the build arguments.
    let buildArgs = [];
    if (buildArgsRaw) buildArgs = buildArgsRaw.match(/\w+=\S+/g).flatMap(str => ["--build-arg", str]);

    // Generate a base image URL.
    const imageURL = `ghcr.io/${ownerName}/${imageName}`;

    // Process the image tags.
    let tags = ["--tag", "latest"];
    if (tagRaw) tags = tagRaw.match(/\w\S+/g).flatMap(str => ["--tag", `${imageURL}:${str}`]);

    /* =========================================================================
        LOG IN TO DOCKER
    ========================================================================= */

    // Log in.
    await exec.exec(
      "docker",
      [
        "login",
        "ghcr.io",
        "--username",
        ownerName,
        "--password",
        accessToken
      ]
    );

    /* =========================================================================
        BUILD THE DOCKER IMAGE(S)
    ========================================================================= */

    // Build the Docker image(s).
    await exec.exec(
      "docker",
      [
        "build",
        ...tags,
        ...buildArgs,
        "--file",
        contextName,
        context
      ]
    );

    /* =========================================================================
        PUSH THE DOCKER IMAGE(S)
    ========================================================================= */

    // Push the Docker image(s).
    let pushTags = tags.filter((item, index) => index % 2 === 1);
    for (let pushImage of pushTags) {
      await exec.exec("docker", ["push", pushImage]);
    }

    /* =========================================================================
        OUTPUT
    ========================================================================= */

    // Output the image URL.
    core.setOutput("imageURL", imageURL);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
