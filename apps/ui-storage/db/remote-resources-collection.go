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

type RemoteResourcesRepo struct {
	coll *mongo.Collection
}

func NewRemoteResourceRepo(conn *mongo.Database) RemoteResourcesRepo {
	return RemoteResourcesRepo{
		coll: conn.Collection("remote-resources"),
	}
}

func (r *RemoteResourcesRepo) InserRemoteResource(remoteResource *models.RemoteResource) error {
	remoteResource.CreatedAt = time.Now().UTC().String()
	_, err := r.coll.InsertOne(context.TODO(), remoteResource)

	return err
}

func (r *RemoteResourcesRepo) RemoveRemoteResource(id string) error {
	filter := bson.M{"id": id}
	opts := options.Delete().SetHint(bson.D{{Key: "_id", Value: 1}})

	_, err := r.coll.DeleteOne(context.TODO(), filter, opts)

	return err
}

func (r *RemoteResourcesRepo) GetAllRemoteResources() ([]models.RemoteResource, error) {
	filter := bson.D{}
	opts := options.Find().SetLimit(50)

	cursor, err := r.coll.Find(context.TODO(), filter, opts)
	if err != nil {
		return nil, err
	}

	var results []models.RemoteResource
	if err = cursor.All(context.TODO(), &results); err != nil {
		return nil, err
	}

	return results, nil
}

func (r *RemoteResourcesRepo) GetRemoteResourceById(id string) (*models.RemoteResource, error) {
	filter := bson.M{"id": id}

	var foundRemoteResource models.RemoteResource
	err := r.coll.FindOne(context.TODO(), filter).Decode(&foundRemoteResource)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}

		return nil, err
	}

	return &foundRemoteResource, nil
}

func (r *RemoteResourcesRepo) ClearMockRemoteResources() {
	deleteRemoteResourceFile := func(fileByteValue []byte) {
		var remoteResource models.RemoteResource

		err := json.Unmarshal(fileByteValue, &remoteResource)
		if err != nil {
			fmt.Println(err)
			return
		}

		err = r.RemoveRemoteResource(*remoteResource.Id)
		if err != nil {
			fmt.Println(err)
			return
		}
	}

	err := utils.OperateOnFilesInFolder("assets/remote-resources", deleteRemoteResourceFile)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func (r *RemoteResourcesRepo) InsertMockRemoteResources() {
	r.ClearMockRemoteResources()

	insertRemoteResourceFile := func(fileByteValue []byte) {
		var remoteResource models.RemoteResource

		err := json.Unmarshal(fileByteValue, &remoteResource)
		if err != nil {
			fmt.Println(err)
			return
		}

		err = r.InserRemoteResource(&remoteResource)
		if err != nil {
			fmt.Println(err)
			return
		}
	}

	err := utils.OperateOnFilesInFolder("assets/remote-resources", insertRemoteResourceFile)
	if err != nil {
		fmt.Println(err)
		return
	}
}
