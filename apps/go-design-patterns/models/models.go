package models

type ShrimpBreed struct {
	ID          uint    `json:"id,omitempty"`
	Breed       string  `json:"breed,omitempty"`
	MinLength   float32 `json:"min_length,omitempty"`
	MaxLength   float32 `json:"max_length,omitempty"`
	AvgLength   float32 `json:"avg_length,omitempty"`
	LifeSpan    uint8   `json:"life_span,omitempty"`
	Description string  `json:"description,omitempty"`
	Origin      string  `json:"origin,omitempty"`
}

type Shrimp struct {
	ID          uint    `json:"id,omitempty"`
	Name        string  `json:"name,omitempty"`
	BreedId     uint    `json:"breed_id,omitempty"`
	BreederId   uint    `json:"breeder_id,omitempty"`
	Age         uint8   `json:"age,omitempty"`
	IsMale      bool    `json:"is_male,omitempty"`
	Length      float32 `json:"length,omitempty"`
	Description string  `json:"description,omitempty"`
}

type Breeder struct {
	ID           uint           `json:"id,omitempty"`
	Name         string         `json:"name,omitempty"`
	Description  string         `json:"description,omitempty"`
	Country      string         `json:"country,omitempty"`
	State        string         `json:"state,omitempty"`
	City         string         `json:"city,omitempty"`
	Phone        string         `json:"phone,omitempty"`
	Email        string         `json:"email,omitempty"`
	IsActive     bool           `json:"is_active,omitempty"`
	ShrimpBreeds []*ShrimpBreed `json:"shrimp_breeds,omitempty"`
}
