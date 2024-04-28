# Definições padrão
.PHONY: up down npm-helpers

up:
	docker-compose up -d --build

down:
	docker-compose down

helpers:
	docker-compose exec app npm run helpers
