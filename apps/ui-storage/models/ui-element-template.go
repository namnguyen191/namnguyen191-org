package models

type UIElementTemplate struct {
	Id                *string                  `json:"id,omitempty" bson:"id,omitempty"`
	Type              *string                  `json:"type,omitempty" bson:"type,omitempty"`
	RemoteResourceId  *string                  `json:"remoteResourceId,omitempty" bson:"remoteResourceId,omitempty"`
	StateSubscription *StateSubscriptionConfig `json:"stateSubscription,omitempty" bson:"stateSubscription,omitempty"`
	Options           *ObjectType              `json:"options,omitempty" bson:"options,omitempty"`
}
