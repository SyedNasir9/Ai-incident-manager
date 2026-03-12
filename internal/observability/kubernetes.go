package observability

import (
	"context"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

// KubeEvent captures a simplified view of a Kubernetes event.
type KubeEvent struct {
	Timestamp          time.Time `json:"timestamp"`
	Type               string    `json:"type"`
	Reason             string    `json:"reason"`
	Message            string    `json:"message"`
	InvolvedObjectKind string    `json:"involved_object_kind"`
	InvolvedObjectName string    `json:"involved_object_name"`
}

// KubernetesClient wraps the client-go kubernetes.Interface for observability queries.
type KubernetesClient struct {
	client kubernetes.Interface
}

// NewInClusterKubernetesClient creates a new client using in-cluster configuration.
func NewInClusterKubernetesClient() (*KubernetesClient, error) {
	cfg, err := rest.InClusterConfig()
	if err != nil {
		return nil, err
	}

	cs, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return nil, err
	}

	return &KubernetesClient{client: cs}, nil
}

// FetchNamespaceEvents fetches events for a namespace and filters for
// pod restarts, OOMKilled, CrashLoopBackOff, and deployment-related changes.
func (k *KubernetesClient) FetchNamespaceEvents(ctx context.Context, namespace string, since time.Time) ([]KubeEvent, error) {
	evs, err := k.client.CoreV1().Events(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var result []KubeEvent
	for _, e := range evs.Items {
		// Only consider newer events if a "since" timestamp is provided.
		eventTime := e.EventTime.Time
		if eventTime.IsZero() && e.LastTimestamp.Time.After(time.Time{}) {
			eventTime = e.LastTimestamp.Time
		}
		if !since.IsZero() && eventTime.Before(since) {
			continue
		}

		if !isInterestingEvent(&e) {
			continue
		}

		result = append(result, KubeEvent{
			Timestamp:          eventTime,
			Type:               e.Type,
			Reason:             e.Reason,
			Message:            e.Message,
			InvolvedObjectKind: e.InvolvedObject.Kind,
			InvolvedObjectName: e.InvolvedObject.Name,
		})
	}

	return result, nil
}

func isInterestingEvent(e *corev1.Event) bool {
	switch e.Reason {
	case "OOMKilled", "CrashLoopBackOff", "BackOff", "Killing", "Created", "ScaledUp", "ScaledDown", "ScalingReplicaSet":
		return true
	}

	// Deployment-related changes.
	if e.InvolvedObject.Kind == "Deployment" {
		return true
	}

	return false
}

