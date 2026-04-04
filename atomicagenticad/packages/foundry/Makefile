.PHONY: build deploy generate-abis write-deployment-summary deploy-all deploy-arc get-address account chain compile coverage flatten fork format lint test verify

DEPLOY_SCRIPT ?= script/Deploy.s.sol
RPC_URL ?= arc
ENV_FILE ?= ../../../.env

# setup wallet for anvil
setup-anvil-wallet:
	shx rm ~/.foundry/keystores/scaffold-eth-default 2>/dev/null; 	shx rm -rf broadcast/Deploy.s.sol/31337
	cast wallet import --private-key 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6 --unsafe-password 'localhost' scaffold-eth-default

# Start local chain
chain: setup-anvil-wallet
	anvil

# Start a fork
fork: setup-anvil-wallet
	anvil --fork-url ${FORK_URL} --chain-id 31337

# Deploy the contracts
deploy:
	@if [ ! -f "$(DEPLOY_SCRIPT)" ]; then 		echo "Error: Deploy script '$(DEPLOY_SCRIPT)' not found"; 		exit 1; 	fi
	@set -a; \
	if [ -f "$(ENV_FILE)" ]; then . "$(ENV_FILE)"; fi; \
	set +a; \
	if [ "$(RPC_URL)" = "localhost" ]; then \
		if [ "$(ETH_KEYSTORE_ACCOUNT)" = "scaffold-eth-default" ]; then \
			forge script $(DEPLOY_SCRIPT) --rpc-url localhost --password localhost --broadcast --ffi; \
		else \
			forge script $(DEPLOY_SCRIPT) --rpc-url localhost --broadcast --ffi; \
		fi; \
	else \
		if [ -z "$$PRIVATE_KEY" ]; then \
			echo "Error: PRIVATE_KEY is not set in $(ENV_FILE)"; \
			exit 1; \
		fi; \
		forge script $(DEPLOY_SCRIPT) --rpc-url $(RPC_URL) --private-key "$$PRIVATE_KEY" --broadcast --ffi; \
	fi

# Deploy and generate ABIs
deploy-and-generate-abis: deploy generate-abis 

# Write a markdown summary for the current deployment
write-deployment-summary:
	node scripts-js/writeDeploymentSummary.js $(RPC_URL)

# Deploy, generate ABIs, and write a readable deployment summary
deploy-all: deploy generate-abis write-deployment-summary

# # Deploy everything to Arc testnet and write deployment artifacts
# deploy-arc:
# 	$(MAKE) deploy-all RPC_URL=arc

# Generate TypeScript ABIs
generate-abis:
	node scripts-js/generateTsAbis.js

# List account
account:
	@node scripts-js/checkAccountBalance.js

# Get address of a keystore
get-address:
	@cast wallet address --account $(ACCOUNT_NAME)

# Compile contracts
compile:
	forge compile

# Flatten contracts
flatten:
	forge flatten

# Format code
format:
	forge fmt && prettier --write ./scripts-js/**/*.js

# Lint code
lint:
	forge fmt --check && prettier --check ./scripts-js/**/*.js

# Run tests
test:
	forge test

coverage:
	forge coverage --report lcov

# Verify contracts
verify:
	forge script script/VerifyAll.s.sol --ffi --rpc-url $(RPC_URL)
