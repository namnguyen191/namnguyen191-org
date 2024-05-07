package models

type StateSubscriptionConfig struct {
	Global *[]string `json:"global,omitempty" bson:"global,omitempty"`
	Layout *[]string `json:"layout,omitempty" bson:"layout,omitempty"`
	Local  *[]string `json:"local,omitempty" bson:"local,omitempty"`
}

type ObjectType *map[string]any
type StringToStringMap *map[string]string
