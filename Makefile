build:
	docker build -t starlight-timber:latest ./merkle-tree

build-multiarch:
	docker buildx build \
		--platform linux/arm64,linux/amd64 \
		--label "org.opencontainers.image.source=https://github.com/eybrativosdigitais/timber" \
		--tag starlight-timber:latest ./merkle-tree

push: build-multiarch
	docker tag starlight-timber:latest ghcr.io/eybrativosdigitais/starlight-timber:latest
	docker tag starlight-timber:latest ghcr.io/eybrativosdigitais/starlight-timber:$(TAG)
	docker push ghcr.io/eybrativosdigitais/starlight-timber:latest
	docker push ghcr.io/eybrativosdigitais/starlight-timber:$(TAG)

scan:
	snyk container test --docker starlight-timber:latest --file=./merkle-tree/Dockerfile --platform=linux/arm64
