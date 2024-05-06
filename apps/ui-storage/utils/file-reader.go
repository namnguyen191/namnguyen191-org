package utils

import (
	"io"
	"os"
)

type FileOperation func([]byte)

func OperateOnFilesInFolder(folderPath string, operation FileOperation) error {
	files, err := os.ReadDir(folderPath)
	if err != nil {
		return err
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		filePath := folderPath + "/" + file.Name()
		fileContent, err := os.Open(filePath)

		if err != nil {
			return err
		}
		defer fileContent.Close()

		fileContentByteValue, _ := io.ReadAll(fileContent)

		operation(fileContentByteValue)
	}

	return nil
}
