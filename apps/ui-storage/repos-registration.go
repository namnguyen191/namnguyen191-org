package main

import "namnguyen191/uistorage/db"

func RegisterAllRepos() {
	App.LayoutsRepo = db.NewLayoutRepo(db.DB)
	App.UIElementTemplatesRepo = db.NewUIElementsRepo(db.DB)
}
