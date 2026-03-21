package similarity

import "math"

// CosineSimilarity computes the cosine similarity between two vectors a and b.
// It returns 0 if the vectors have different lengths or if either vector has
// zero magnitude.
func CosineSimilarity(a, b []float64) float64 {
	if len(a) == 0 || len(a) != len(b) {
		return 0
	}

	var dot, magA2, magB2 float64
	for i := range a {
		dot += a[i] * b[i]
		magA2 += a[i] * a[i]
		magB2 += b[i] * b[i]
	}

	if magA2 == 0 || magB2 == 0 {
		return 0
	}

	return dot / (math.Sqrt(magA2) * math.Sqrt(magB2))
}

