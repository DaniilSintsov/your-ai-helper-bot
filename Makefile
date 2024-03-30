build:
	docker build -t your-ai-helper-bot .

run:
	docker run -d -p 3000:3000 --name your-ai-helper-bot --rm your-ai-helper-bot
