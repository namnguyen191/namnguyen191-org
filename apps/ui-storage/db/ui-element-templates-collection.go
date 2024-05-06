package db

import (
	"context"
	"encoding/json"
	"fmt"
	"namnguyen191/uistorage/models"
	"namnguyen191/uistorage/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UIElementTemplatesRepo struct {
	coll *mongo.Collection
}

func NewUIElementsRepo(conn *mongo.Database) UIElementTemplatesRepo {
	return UIElementTemplatesRepo{
		coll: conn.Collection("ui-element-templates"),
	}
}

func (r *UIElementTemplatesRepo) InserUIElementTemplate(uiElementTemplate *models.UIElementTemplate) error {
	_, err := r.coll.InsertOne(context.TODO(), uiElementTemplate)

	return err
}

func (r *UIElementTemplatesRepo) RemoveUIElementTemplate(id string) error {
	filter := bson.M{"id": id}
	opts := options.Delete().SetHint(bson.D{{Key: "_id", Value: 1}})

	_, err := r.coll.DeleteOne(context.TODO(), filter, opts)

	return err
}

func (r *UIElementTemplatesRepo) GetAllUIElementTemplates() ([]models.UIElementTemplate, error) {
	filter := bson.D{}
	opts := options.Find().SetLimit(50)

	cursor, err := r.coll.Find(context.TODO(), filter, opts)
	if err != nil {
		return nil, err
	}

	var results []models.UIElementTemplate
	if err = cursor.All(context.TODO(), &results); err != nil {
		return nil, err
	}

	return results, nil
}

func (r *UIElementTemplatesRepo) GetUIElementTemplateById(id string) (*models.UIElementTemplate, error) {
	filter := bson.M{"id": id}

	var foundUIElementTemplate models.UIElementTemplate
	err := r.coll.FindOne(context.TODO(), filter).Decode(&foundUIElementTemplate)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}

		return nil, err
	}

	return &foundUIElementTemplate, nil
}

func (r *UIElementTemplatesRepo) ClearMockUIElementTemplates() {
	deleteUIElementTemplateFile := func(fileByteValue []byte) {
		var uiElementTemplate models.UIElementTemplate

		err := json.Unmarshal(fileByteValue, &uiElementTemplate)
		if err != nil {
			fmt.Println(err)
			return
		}

		err = r.RemoveUIElementTemplate(*uiElementTemplate.Id)
		if err != nil {
			fmt.Println(err)
			return
		}
	}

	err := utils.OperateOnFilesInFolder("assets/elements", deleteUIElementTemplateFile)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func (r *UIElementTemplatesRepo) InsertMockUIElementTemplates() {
	r.ClearMockUIElementTemplates()

	insertUIElementTemplateFile := func(fileByteValue []byte) {
		var uiElementTemplate models.UIElementTemplate

		err := json.Unmarshal(fileByteValue, &uiElementTemplate)
		if err != nil {
			fmt.Println(err)
			return
		}

		err = r.InserUIElementTemplate(&uiElementTemplate)
		if err != nil {
			fmt.Println(err)
			return
		}
	}

	err := utils.OperateOnFilesInFolder("assets/elements", insertUIElementTemplateFile)
	if err != nil {
		fmt.Println(err)
		return
	}
}
