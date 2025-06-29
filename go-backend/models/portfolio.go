package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Portfolio struct {
	ID             primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Name           string             `json:"name" bson:"name"`
	Location       string             `json:"location" bson:"location"`
	Contact        Contact            `json:"contact" bson:"contact"`
	Title          string             `json:"title" bson:"title"`
	Bio            string             `json:"bio" bson:"bio"`
	PortraitURL    string             `json:"portraitUrl" bson:"portraitUrl"`
	Experiences    []Experience       `json:"experiences" bson:"experiences"`
	Certifications []Certification    `json:"certifications" bson:"certifications"`
	Education      Education          `json:"education" bson:"education"`
	Skills         Skills             `json:"skills" bson:"skills"`
	SocialLinks	   SocialLinks        `json:"socialLinks" bson:"socialLinks"`
	Achievements   []Achievement      `json:"achievements" bson:"achievements"`
	CurrentWorks   []CurrentWork      `json:"currentWorks" bson:"currentWorks"`
	CreatedAt 	   time.Time 		  `json:"createdAt" bson:"createdAt"`
	UpdatedAt 	   time.Time 		  `json:"updatedAt" bson:"updatedAt"`

}

type Contact struct {
	Phone    string `json:"phone" bson:"phone"`
	Email    string `json:"email" bson:"email"`
	LinkedIn string `json:"linkedin" bson:"linkedin"`
}

type Experience struct {
	Title       string   `json:"title" bson:"title"`
	Description []string `json:"description" bson:"description"`
	Location    string   `json:"location" bson:"location"`
	Period      string   `json:"period" bson:"period"`
}

type Certification struct {
	Title  string `json:"title" bson:"title"`
	Issuer string `json:"issuer" bson:"issuer"`
	Year   string `json:"year" bson:"year"`
}

type Education struct {
	Degree      string   `json:"degree" bson:"degree"`
	Institution string   `json:"institution" bson:"institution"`
	Courses     []string `json:"courses" bson:"courses"`
}

type Skills struct {
	Cloud        []string `json:"cloud" bson:"cloud"`
	DevOps       []string `json:"devops" bson:"devops"`
	Networking   []string `json:"networking" bson:"networking"`
	Monitoring   []string `json:"monitoring" bson:"monitoring"`
	Security     []string `json:"security" bson:"security"`
	Scripting    []string `json:"scripting" bson:"scripting"`
	Systems      []string `json:"systems" bson:"systems"`
	Virtualization []string `json:"virtualization" bson:"virtualization"`
}

type Achievement struct {
	Title       string `json:"title" bson:"title"`
	Organizer   string `json:"organizer" bson:"organizer"`
	Description string `json:"description" bson:"description"`
}

type CurrentWork struct {
	Title       string `json:"title" bson:"title"`
	Description string `json:"description" bson:"description"`
}

type SocialLinks struct {
	LinkedIn  string `json:"linkedin" bson:"linkedin"`
	GitHub    string `json:"github" bson:"github"`
	Website   string `json:"website" bson:"website"`
	Twitter   string `json:"twitter" bson:"twitter"`
	Instagram string `json:"instagram" bson:"instagram"`
}
