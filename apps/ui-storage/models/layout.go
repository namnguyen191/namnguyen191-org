package models

type ElementInstancePositionAndSizeConfig struct {
	X             *int  `json:"x,omitempty" bson:"x,omitempty"`
	Y             *int  `json:"y,omitempty" bson:"y,omitempty"`
	Cols          *int  `json:"cols,omitempty" bson:"cols,omitempty"`
	Rows          *int  `json:"rows,omitempty" bson:"rows,omitempty"`
	ResizeEnabled *bool `json:"resizeEnabled,omitempty" bson:"resizeEnabled,omitempty"`
	DragEnabled   *bool `json:"dragEnabled,omitempty" bson:"dragEnabled,omitempty"`
}

type UIElementInstance struct {
	Id                  *string                               `json:"id,omitempty" bson:"id,omitempty"`
	UIElementTemplateId *string                               `json:"uiElementTemplateId,omitempty" bson:"uiElementTemplateId,omitempty"`
	PositionAndSize     *ElementInstancePositionAndSizeConfig `json:"positionAndSize,omitempty" bson:"positionAndSize,omitempty"`
}

type LayoutGridConfigs struct {
	Gap *int `json:"gap,omitempty" bson:"gap,omitempty"`
}

type Layout struct {
	Id                 *string              `json:"id,omitempty" bson:"id,omitempty"`
	GridConfigs        *LayoutGridConfigs   `json:"gridConfigs,omitempty" bson:"gridConfigs,omitempty"`
	UIElementInstances *[]UIElementInstance `json:"uiElementInstances,omitempty" bson:"uiElementInstances,omitempty"`
}
