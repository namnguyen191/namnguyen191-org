package models

type ElementInstancePositionAndSizeConfig struct {
	X             int  `json:"x"`
	Y             int  `json:"y"`
	Cols          int  `json:"cols"`
	Rows          int  `json:"rows"`
	ResizeEnabled bool `json:"resize_enabled"`
	DragEnabled   bool `json:"drag_enabled"`
}

type UIElementInstance struct {
	ID                  int                                  `json:"id"`
	UIElementTemplateId int                                  `json:"ui_element_template_id"`
	PositionAndSize     ElementInstancePositionAndSizeConfig `json:"position_and_size"`
}

type Layout struct {
	ID                 int                 `json:"id"`
	UIElementInstances []UIElementInstance `json:"ui_element_instances"`
}
