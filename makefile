resurrect:
	yarn --cwd ./server db-resurrect


server:
	yarn server-dev

server-build:
	yarn server-build


client:
	yarn --cwd ./client dev

install-server:
	yarn --cwd ./server

install-client:
	yarn --cwd ./client

server-build:
	yarn server-build

server-test:
	yarn server-test

client-dev:
	yarn client-dev

client-build:
	yarn client-build

client-test:
	yarn client-test

install-all:
	yarn install-all

backup:
	yarn --cwd ./server backup-db --model Wallet User

generate-master-wallet:
	yarn --cwd ./server generate-master


reset-db-generate-wallet:
	make backup && make resurrect && make generate-master-wallet

reset-db:
	make backup && make resurrect

pull-reload-logs:
	git pull && pm2 reload all --update-env && pm2 flush && pm2 logs

create-webhook:
	yarn --cwd ./server webhook-create

delete-webhook:
	yarn --cwd ./server webhook-delete

update-wallet:
	yarn --cwd ./server update-wallet

deposit-to-master:
	yarn --cwd ./server deposit-to-master
	
sandbox:
	yarn --cwd ./server sandbox

start-ngrok:
	ngrok http 8080


