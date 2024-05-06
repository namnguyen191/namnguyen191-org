package models

type ElementInstancePositionAndSizeConfig struct {
	X             *int  `json:"x,omitempty" bson:"x,omitempty"`
	Y             *int  `json:"y,omitempty" bson:"y,omitempty"`
	Cols          *int  `json:"cols,omitempty" bson:"cols,omitempty"`
	Rows          *int  `json:"rows,omitempty" bson:"rows,omitempty"`
	ResizeEnabled *bool `json:"resize_enabled,omitempty" bson:"resizeEnabled,omitempty"`
	DragEnabled   *bool `json:"drag_enabled,omitempty" bson:"dragEnabled,omitempty"`
}

type UIElementInstance struct {
	ID                  *string                               `json:"id,omitempty" bson:"id,omitempty"`
	UIElementTemplateId *string                               `json:"uiElementTemplateId,omitempty" bson:"uiElementTemplateId,omitempty"`
	PositionAndSize     *ElementInstancePositionAndSizeConfig `json:"positionAndSize,omitempty" bson:"positionAndSize,omitempty"`
}

type Layout struct {
	ID                 *string              `json:"id,omitempty" bson:"id,omitempty"`
	UIElementInstances *[]UIElementInstance `json:"uiElementInstances,omitempty" bson:"uiElementInstances,omitempty"`
}
