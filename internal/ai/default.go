package ai

// DefaultClient is a global Ollama client reference.
// It can be set during application startup.
var DefaultClient *OllamaClient

// SetDefaultClient sets the global Ollama client.
func SetDefaultClient(c *OllamaClient) {
	DefaultClient = c
}
