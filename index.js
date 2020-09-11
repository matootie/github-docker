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
    const crRaw = core.getInput("containerRegistry", { required: true });
    const repositoryRaw = core.getInput("repository", { required: false });

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

    const username = process.env.GITHUB_ACTOR;

    // The access token is as-is.
    const accessToken = accessTokenRaw;

    // Get the optional repository name.
    let repository = repositoryRaw
    if (!repository) {
      repository = process.env.GITHUB_REPOSITORY;
    }
    repository = repository.toLowerCase();

    // Decide whether or not we're pushing to container registry.
    console.log(crRaw);
    console.log((crRaw == "true"));
    console.log((crRaw == "false"));
    const containerRegistryEnabled = (crRaw == "true");

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
    let imageURL;
    if (containerRegistryEnabled) {
      imageURL = `ghcr.io/${ownerName}/${imageName}`;
    } else {
      imageURL = `docker.pkg.github.com/${repository}/${imageName}`;
    }

    // Process the image tags.
    let tags = ["--tag", "latest"];
    if (tagRaw) tags = tagRaw.match(/\w\S+/g).flatMap(str => ["--tag", `${imageURL}:${str}`]);

    /* =========================================================================
        LOG IN TO DOCKER
    ========================================================================= */

    // Log in.
    if (containerRegistryEnabled) {
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
    } else {
      await exec.exec(
        "docker",
        [
          "login",
          "ghcr.io",
          "--username",
          username,
          "--password",
          accessToken
        ]
      );
    }

    /* =========================================================================
        BUILD THE DOCKER IMAGES
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
        PUSH THE DOCKER IMAGES
    ========================================================================= */

    // Push the Docker image(s).
    let pushTags = tags.filter((item, index) => index % 2 === 1);
    for (let pushImage of pushTags) {
      await exec.exec("docker", [ "push", pushImage ]);
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
