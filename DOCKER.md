# Docker

## Overview

This document describes how to build and push Docker images to GitHub Container Registry.

## Usage

### Build

This will build the Docker image with the name and tag `starlight-timber:latest`.

```bash
make build
# or simply
docker build -t starlight-timber:latest ./merkle-tree
```

### Push

Before pushing the Docker image, you need to create a Personal Access Token (PAT) with `write:packages` scope for Github Packages

1. Create PAT - Visit <https://github.com/settings/tokens/new?scopes=write:packages>
2. Login to GitHub Container Registry

    ```bash
    export CR_PAT=YOUR_TOKEN
    echo $CR_PAT | docker login ghcr.io -u <USERNAME> --password-stdin
    ```

3. Build and push the Docker image

    This will build multi-arch image, tag it with `latest` and the tag you provided, and push to GitHub Container Registry.

    ```bash
    make push TAG=<tag>
    ```

## References

- <https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-with-a-personal-access-token-classic>
