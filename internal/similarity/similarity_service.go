package similarity

import (
	"context"
	"sort"

	"github.com/syednasir/ai-incident-manager/internal/storage"
	"github.com/syednasir/ai-incident-manager/pkg/models"
)

type SimilarityService struct {
	Repo *storage.EmbeddingRepository
}

func NewSimilarityService(repo *storage.EmbeddingRepository) *SimilarityService {
	return &SimilarityService{Repo: repo}
}

// FindSimilarIncidents finds the most similar incidents to the provided
// embedding vector for a given incident, ordered by cosine similarity
// (descending), limited to N.
func (s *SimilarityService) FindSimilarIncidents(
	ctx context.Context,
	incidentID string,
	embedding []float64,
	limit int,
) ([]models.SimilarIncident, error) {
	if limit <= 0 {
		limit = 10
	}

	all, err := s.Repo.GetAllEmbeddings(ctx)
	if err != nil {
		return nil, err
	}

	var sims []models.SimilarIncident

	for _, e := range all {
		// Skip the same incident.
		if e.IncidentID == incidentID {
			continue
		}

		score := CosineSimilarity(embedding, e.Embedding)
		if score <= 0 {
			continue
		}

		sims = append(sims, models.SimilarIncident{
			IncidentID: e.IncidentID,
			Score:      score,
		})
	}

	sort.Slice(sims, func(i, j int) bool {
		return sims[i].Score > sims[j].Score
	})

	if len(sims) > limit {
		sims = sims[:limit]
	}

	return sims, nil
}

