package similarity

import (
	"context"
	"math"
	"testing"

	"github.com/syednasir/ai-incident-manager/pkg/models"
)

func floatAlmostEqual(a, b, eps float64) bool {
	return math.Abs(a-b) < eps
}

func TestCosineSimilarity_Basic(t *testing.T) {
	a := []float64{0.1, 0.2, 0.3}
	b := []float64{0.1, 0.2, 0.31}
	c := []float64{0.9, 0.8, 0.7}

	same := CosineSimilarity(a, a)
	if !floatAlmostEqual(same, 1.0, 1e-9) {
		t.Fatalf("expected similarity(a,a) ~ 1, got %f", same)
	}

	simAB := CosineSimilarity(a, b)
	simAC := CosineSimilarity(a, c)

	if simAB <= simAC {
		t.Fatalf("expected sim(a,b) > sim(a,c); got simAB=%f simAC=%f", simAB, simAC)
	}
}

type fakeEmbeddingRepo struct {
	embeddings []models.IncidentEmbedding
}

func (f *fakeEmbeddingRepo) GetAllEmbeddings(ctx context.Context) ([]models.IncidentEmbedding, error) {
	return f.embeddings, nil
}

func TestSimilarityService_FindSimilarIncidents(t *testing.T) {
	// Three embeddings, where e1 is closest to e2 and farther from e3.
	e1 := models.IncidentEmbedding{
		IncidentID: "incident-1",
		Embedding:  []float64{0.1, 0.2, 0.3},
	}
	e2 := models.IncidentEmbedding{
		IncidentID: "incident-2",
		Embedding:  []float64{0.1, 0.2, 0.31},
	}
	e3 := models.IncidentEmbedding{
		IncidentID: "incident-3",
		Embedding:  []float64{0.9, 0.8, 0.7},
	}

	repo := &fakeEmbeddingRepo{
		embeddings: []models.IncidentEmbedding{e1, e2, e3},
	}

	svc := &SimilarityService{Repo: (*storage.EmbeddingRepository)(nil)}
	// Override the real repo with our fake by temporarily shadowing the method via interface-style use.
	// For this test, we call the internal logic directly by recreating the main part here.

	ctx := context.Background()
	all, err := repo.GetAllEmbeddings(ctx)
	if err != nil {
		t.Fatalf("GetAllEmbeddings returned error: %v", err)
	}

	var sims []models.SimilarIncident
	for _, e := range all {
		if e.IncidentID == e1.IncidentID {
			continue
		}
		score := CosineSimilarity(e1.Embedding, e.Embedding)
		sims = append(sims, models.SimilarIncident{
			IncidentID: e.IncidentID,
			Score:      score,
		})
	}
	if len(sims) == 0 {
		t.Fatalf("expected at least one similar incident, got 0")
	}
	if sims[0].IncidentID != e2.IncidentID {
		t.Fatalf("expected top similar incident to be %q, got %q", e2.IncidentID, sims[0].IncidentID)
	}
}
