package models

type FetchDataParams struct {
	Endpoint *string            `json:"endpoint,omitempty" bson:"endpoint,omitempty"`
	Method   *string            `json:"method,omitempty" bson:"method,omitempty"`
	Body     *string            `json:"body,omitempty" bson:"body,omitempty"`
	Headers  *StringToStringMap `json:"headers,omitempty" bson:"headers,omitempty"`
}

type Request struct {
	Configs       *FetchDataParams `json:"configs,omitempty" bson:"configs,omitempty"`
	Interpolation *string          `json:"interpolation,omitempty" bson:"interpolation,omitempty"`
}

type RemoteResource struct {
	Id                *string                  `json:"id,omitempty" bson:"id,omitempty"`
	StateSubscription *StateSubscriptionConfig `json:"stateSubscription,omitempty" bson:"stateSubscription,omitempty"`
	Options           *ObjectType              `json:"options,omitempty" bson:"options,omitempty"`
}
