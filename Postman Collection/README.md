# Postman Collection

## Importing Humly Environment

In order to use this collection, you have to import <b>Humly Environment</b> first from `Humly Environment.postman_environment.json` file. In Postman go to "Manage Environments" by clicking on cogwheel in upper right corner. By selecting Import button and providing Environment file you can finish this. After successful environment import you have to select it from dropdown list located in top right part of Postman application.

## Import Humly Postman Collection

From menu select File --> Import. In “Import File” tab provide click on “Choose File” and navigate to `Humly REST integration.postman_collection.json` file. By clicking on “Open” button you will finish import process.

## Working with Humly Postman Collection

This Postman collection is designed to store some values for you. The first step is to save the username and password of the user connecting to the API. To do this, click the cogwheel icon, select the Humly Environment, and paste the username and password into the CURRENT VALUE fields. For more information, please refer to the Authenticate with Humly Control Panel (HCP) API section in the README.md file located in the root of the documentation folder.
Execute “Login” API call located under Auth folder in Humly REST integration collection. By executing this call, you will store `X-User-Id` and `X-User-Token` necessary to authenticate other REST calls. You can also execute All Rooms API call located under Rooms folder in order to store `roomId` of first room returned by this call.

If you want to use other `roomId` you can provide it as CURRENT VALUE for `roomId` Humly Environment variable any time you like. You can do the same for all other variables.
