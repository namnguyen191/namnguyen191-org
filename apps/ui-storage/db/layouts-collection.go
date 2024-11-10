package db

import (
	"context"
	"encoding/json"
	"fmt"
	"namnguyen191/uistorage/models"
	"namnguyen191/uistorage/utils"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type LayoutsRepo struct {
	coll *mongo.Collection
}

func NewLayoutRepo(conn *mongo.Database) LayoutsRepo {
	return LayoutsRepo{
		coll: conn.Collection("layouts"),
	}
}

func (r *LayoutsRepo) InserLayout(layout *models.Layout) error {
	layout.CreatedAt = time.Now().UTC().String()
	_, err := r.coll.InsertOne(context.TODO(), layout)

	return err
}

func (r *LayoutsRepo) UpdateLayout(updatedLayout *models.Layout) error {
	filter := bson.M{"id": updatedLayout.Id}
	updatedLayout.UpdatedAt = time.Now().UTC().String()
	singleResult := r.coll.FindOneAndReplace(context.TODO(), filter, updatedLayout)

	return singleResult.Err()
}

func (r *LayoutsRepo) RemoveLayout(id string) error {
	filter := bson.M{"id": id}
	opts := options.Delete().SetHint(bson.D{{Key: "_id", Value: 1}})

	_, err := r.coll.DeleteOne(context.TODO(), filter, opts)

	return err
}

func (r *LayoutsRepo) GetAllLayouts() ([]models.Layout, error) {
	filter := bson.D{}
	opts := options.Find().SetLimit(50)

	cursor, err := r.coll.Find(context.TODO(), filter, opts)
	if err != nil {
		return nil, err
	}

	var results []models.Layout
	if err = cursor.All(context.TODO(), &results); err != nil {
		return nil, err
	}

	return results, nil
}

func (r *LayoutsRepo) GetLayoutById(id string) (*models.Layout, error) {
	filter := bson.M{"id": id}

	var foundLayout models.Layout
	err := r.coll.FindOne(context.TODO(), filter).Decode(&foundLayout)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}

		return nil, err
	}

	return &foundLayout, nil
}

func (r *LayoutsRepo) ClearMockLayouts() {
	deleteLayoutFile := func(fileByteValue []byte) {
		var layout models.Layout

		err := json.Unmarshal(fileByteValue, &layout)
		if err != nil {
			fmt.Println(err)
			return
		}

		err = r.RemoveLayout(*layout.Id)
		if err != nil {
			fmt.Println(err)
			return
		}
	}

	err := utils.OperateOnFilesInFolder("assets/layouts", deleteLayoutFile)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func (r *LayoutsRepo) InsertMockLayouts() {
	r.ClearMockLayouts()

	insertLayoutFile := func(fileByteValue []byte) {
		var layout models.Layout

		err := json.Unmarshal(fileByteValue, &layout)
		if err != nil {
			fmt.Println(err)
			return
		}

		err = r.InserLayout(&layout)
		if err != nil {
			fmt.Println(err)
			return
		}
	}

	err := utils.OperateOnFilesInFolder("assets/layouts", insertLayoutFile)
	if err != nil {
		fmt.Println(err)
		return
	}
}
