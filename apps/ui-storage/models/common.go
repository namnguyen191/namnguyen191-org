package models

type WatchedScopes struct {
	Global *[]string `json:"global,omitempty" bson:"global,omitempty"`
	Layout *[]string `json:"layout,omitempty" bson:"layout,omitempty"`
	Local  *[]string `json:"local,omitempty" bson:"local,omitempty"`
}

type StateSubscriptionConfig struct {
	WatchedScopes *WatchedScopes `json:"watchedScopes,omitempty" bson:"watchedScopes,omitempty"`
	Variables     ObjectType     `json:"variables,omitempty" bson:"variables,omitempty"`
}

type TimeStamps struct {
	CreatedAt string `json:"createdAt,omitempty" bson:"createdAt,omitempty"`
	UpdatedAt string `json:"updatedAt,omitempty" bson:"updatedAt,omitempty"`
}

type ObjectType *map[string]any
type StringToStringMap *map[string]string
