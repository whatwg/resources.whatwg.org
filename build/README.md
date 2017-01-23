# Build resources

The resources in this folder are used for building WHATWG specifications.

## `deploy.sh`

The `deploy.sh` script is used by most WHATWG specifications and is meant to run either on Travis CI, or locally with the `--local` command-line flag for preview purposes. It performs the following steps:

- Running [Bikeshed](https://github.com/tabatkins/bikeshed), through its [web API](https://api.csswg.org/bikeshed/), to produce:
  - If on master, the built living standard, as well as a commit snapshot
  - Otherwise, a branch snapshot of the specification
- Running the [Nu HTML checker](http://checker.html5.org/) on the build results
- Deploying the build results to the WHATWG web server

For non-local deploys, it is dependent on the following environment setup:

- `deploy_key.enc` must contain a SSH private key, [encrypted for Travis](https://docs.travis-ci.com/user/encrypting-files/) for the appropriate repository.
- The environment variable `$ENCRYPTION_LABEL` must contain the encryption label produced by the Travis encryption process.
- The environment variable `$DEPLOY_USER` must contain the username used to SSH into the WHATWG web server.

An example `.travis.yml` file that uses this script would then be as follows:

```yaml
language: generic

env:
  global:
    - ENCRYPTION_LABEL="1337deadb33f"
    - DEPLOY_USER="yourusername"

script:
  - curl --remote-name --fail https://resources.whatwg.org/build/deploy.sh && bash ./deploy.sh

notifications:
  email:
    on_success: never
    on_failure: always
```

Similarly, a local deploy can be performed with

```bash
curl --remote-name --fail https://resources.whatwg.org/build/deploy.sh && bash ./deploy.sh --local
```
