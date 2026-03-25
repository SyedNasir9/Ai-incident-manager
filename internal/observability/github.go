package observability

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// CommitInfo represents a simplified Git commit from the GitHub API.
type CommitInfo struct {
	Message   string    `json:"message"`
	Author    string    `json:"author"`
	Timestamp time.Time `json:"timestamp"`
}

// PullRequestInfo represents a merged pull request.
type PullRequestInfo struct {
	Title    string    `json:"title"`
	Author   string    `json:"author"`
	MergedAt time.Time `json:"merged_at"`
	Number   int       `json:"number"`
}

// GitHubClient is a minimal client for the GitHub REST API.
type GitHubClient struct {
	httpClient *http.Client
	baseURL    string
	token      string
}

// NewGitHubClient creates a new GitHub client.
// If token is non-empty, it will be used for Authorization.
func NewGitHubClient(token string) *GitHubClient {
	return &GitHubClient{
		httpClient: &http.Client{Timeout: 10 * time.Second},
		baseURL:    "https://api.github.com",
		token:      token,
	}
}

// FetchRecentCommits fetches commits in the last hour for the given repository.
func (c *GitHubClient) FetchRecentCommits(owner, repo string) ([]CommitInfo, error) {
	since := time.Now().Add(-1 * time.Hour).UTC().Format(time.RFC3339)
	url := fmt.Sprintf("%s/repos/%s/%s/commits?since=%s", c.baseURL, owner, repo, since)

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	c.addAuthHeaders(req)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github commits: unexpected status %d", resp.StatusCode)
	}

	var apiCommits []struct {
		Commit struct {
			Message string `json:"message"`
			Author  struct {
				Name  string    `json:"name"`
				Date  time.Time `json:"date"`
				Email string    `json:"email"`
			} `json:"author"`
		} `json:"commit"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&apiCommits); err != nil {
		return nil, err
	}

	result := make([]CommitInfo, 0, len(apiCommits))
	for _, cmt := range apiCommits {
		result = append(result, CommitInfo{
			Message:   cmt.Commit.Message,
			Author:    cmt.Commit.Author.Name,
			Timestamp: cmt.Commit.Author.Date,
		})
	}

	return result, nil
}

// FetchRecentMergedPRs fetches pull requests merged in the last hour.
func (c *GitHubClient) FetchRecentMergedPRs(owner, repo string) ([]PullRequestInfo, error) {
	oneHourAgo := time.Now().Add(-1 * time.Hour).UTC()
	url := fmt.Sprintf("%s/repos/%s/%s/pulls?state=closed&per_page=100", c.baseURL, owner, repo)

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	c.addAuthHeaders(req)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github pulls: unexpected status %d", resp.StatusCode)
	}

	var apiPRs []struct {
		Number int    `json:"number"`
		Title  string `json:"title"`
		User   struct {
			Login string `json:"login"`
		} `json:"user"`
		MergedAt *time.Time `json:"merged_at"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&apiPRs); err != nil {
		return nil, err
	}

	var result []PullRequestInfo
	for _, pr := range apiPRs {
		if pr.MergedAt == nil {
			continue
		}
		if pr.MergedAt.Before(oneHourAgo) {
			continue
		}

		result = append(result, PullRequestInfo{
			Title:    pr.Title,
			Author:   pr.User.Login,
			MergedAt: *pr.MergedAt,
			Number:   pr.Number,
		})
	}

	return result, nil
}

func (c *GitHubClient) addAuthHeaders(req *http.Request) {
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}
	req.Header.Set("Accept", "application/vnd.github+json")
}
