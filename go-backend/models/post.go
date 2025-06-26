
package models

import (
    "time"

    "go.mongodb.org/mongo-driver/bson/primitive"
)

type Post struct {
    ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Title      string             `json:"title"`
    Content    string             `json:"content"`
    Summary    string             `json:"summary"`
    Type       string             `json:"type"` // article, news, tutorial
    Date       string             `json:"date"`
    AuthorID   string             `json:"authorId"`
    CategoryID string             `json:"categoryId,omitempty"`
    Tags       []Tag              `json:"tags,omitempty"`
    CoverImage *MediaAsset        `json:"coverImage,omitempty"`
    Gallery    []MediaAsset       `json:"gallery,omitempty"`
    CreatedAt  time.Time          `json:"createdAt"`
    UpdatedAt  time.Time          `json:"updatedAt"`
}

type MediaAsset struct {
    ID         string    `json:"id"`
    URL        string    `json:"url"`
    AltText    string    `json:"altText,omitempty"`
    UploadedBy string    `json:"uploadedBy"`
    PostID     string    `json:"postId,omitempty"`
    Type       string    `json:"type"`
    CreatedAt  time.Time `json:"createdAt"`
}
