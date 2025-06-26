package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Tag struct {
    ID    primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	TagID string             `json:"tagID" bson:"tagID"`
    Name  string             `json:"name" bson:"name"`
}