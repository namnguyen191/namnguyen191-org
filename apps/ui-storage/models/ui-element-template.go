package models

type UIElementTemplate struct {
	Id                *string                  `json:"id,omitempty" bson:"id,omitempty"`
	Type              *string                  `json:"type,omitempty" bson:"type,omitempty"`
	RemoteResourceIds *[]string                `json:"remoteResourceIds,omitempty" bson:"remoteResourceIds,omitempty"`
	StateSubscription *StateSubscriptionConfig `json:"stateSubscription,omitempty" bson:"stateSubscription,omitempty"`
	Options           *ObjectType              `json:"options,omitempty" bson:"options,omitempty"`
}
