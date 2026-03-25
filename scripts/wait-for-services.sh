#!/bin/sh

# Wait for services to be ready
echo "🔍 Waiting for services to be ready..."

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
until nc -z postgres 5432; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
done
echo "✅ PostgreSQL is ready"

# Wait for Ollama
echo "⏳ Waiting for Ollama..."
until nc -z ollama 11434; do
    echo "Ollama is unavailable - sleeping"
    sleep 2
done
echo "✅ Ollama is ready"

# Check if TinyLlama model is available
echo "🤖 Checking TinyLlama model..."
if ! ollama list | grep -q "tinyllama"; then
    echo "📥 Pulling TinyLlama model..."
    ollama pull tinyllama
    echo "✅ TinyLlama model ready"
else
    echo "✅ TinyLlama model already available"
fi

echo "🚀 All services are ready!"
