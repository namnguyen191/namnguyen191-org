package main

func main() {
	initApp()
	defer cleanUpApp()

	// App.LayoutsRepo.InsertMockLayouts()
	// App.UIElementTemplatesRepo.InsertMockUIElementTemplates()
	// App.RemoteResourcesRepo.InsertMockRemoteResources()

	App.server.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
