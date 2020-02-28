# Humly Control Panel API docs

API documentation for Humly Control Panel version: `v1.0.x`

- [Introduction](#introduction)
- [Response content](#responseContent)
- [Authenticate with Humly Control Panel](#authentication)
- [Register a client group - `POST {HCP_URL}/api/v1/clientGroups`](#clientGroups)
- [Working with “users” API - `{HCP_URL}/api/v1/users/integration`](#users)
- [Get rooms data - `{HCP_URL}/api/v1/rooms`](#rooms)
- [Working with “bookings” API - `{HCP_URL}/api/v1/bookings`](#bookings)
- [Get organizer meetings – `GET {HCP_URL}/api/v1/bookings`](#getMeetings)
- [Create a meeting - `POST {HCP_URL}/api/v1/bookings`](#createMeeting)
- [Update a meeting - `PATCH {HCP_URL}/api/v1/bookings/:bookingId`](#updateMeeting)
- [Delete a meeting - `DELETE {HCP_URL}/api/v1/bookings/:bookingId`](#deleteMeeting)
- [Check-in a meeting - `PUT {HCP_URL}/api/v1/bookings/checkedIn?bookingId=:bookingId`](#checkInMeeting)
- [Get structures data - `GET {HCP_URL}/api/v1/structures`](#structures)

## <a name="introduction"></a> Introduction

Welcome and thank you for using Humly Control Panel API!
In this document you can find description of available API endpoints for integrating with Humly Control Panel (HCP) along with parameters specification. You can also find basic examples written in React using Axios library. 

> 👉 **Disclaimer!** The code examples provided in this document are written as basic examples. You should change and adopt this code according to your production needs.

Humly Control Panel is the server-side software used to manage and monitor your Humly devices. These devices provide booking functionalities for you. You can display, book, confirm etc. your booking by using them. Humly Control Panel also serves as central data repository used to synchronize all your devices. This platform is built on the full stack JavaScript framework [Meteor](https://www.meteor.com/) which uses the DDP protocol to send/receive requests. 

## <a name="responseContent"></a> Response content

Responses from Humly Control Panel API have standardized format. There are two response types that you can expect: <b><i>success response</i></b> and <b><i>error response</i></b>.<br><br>
Format of <b><i>success response</i></b> is:<br>
```c++
{
  "status": "success",
  "data": %any%,                 // Mandatory part of response. Type of data can be null, string, number, boolean, object {} or array []. It represents data returned from endpoint.
  "page": {                      // Optional object. Present only in case of pagination.
    "first": %boolean%,          // Is first page?
    "last": %boolean%,           // Is last page?
    "size": %number%,            // Number of elements per page.
    "totalElements": %number%,   // Total elements that query returns.
    "totalPages": %number%,      // Total number of pages.
    "number": %number%,          // Number of current page.
    "numberOfElements": %number% // Number of elements on current page. Last page could be partially filled.
  },
  "sort": [                      // Optional array of objects. Present only in case of data sorting.
    {
      "property": %string%,      // name of property to sort by
      "direction": %string%      // "ASC" or "DESC". Lowercase values are also acceptable.
    }
  ],
}
```
In examples provided in rest of this document you can find this object as part of <i>responseData</i>.<br> If API endpoint returns array or results then you can expect to have pagination and sort options.<br>
Data paging is done by providing two variables as request params. <b><i>pageNumber</i></b> param is used to navigate through paginated data and <b><i>pageSize</i></b> is used to limit maximum number of data returned by endpoint. Default values for pageNumber is 1 and for pageSize is 10. If endpoint supports data paging then you can always expect to have <b><i>page</i></b> object (documented above) in case of success.<br>
Sorting is done by providing <b><i>sort</i></b> stringified object as a request param. Object should contain key value pairs where key should be name of response data property and value should be one of "asc" od "desc". If you want to sort data by some nested property inside other object then you should use dot notation to point to that property. For example sort param could look like: `{ "booking.location": "asc", "booking.startDate": "desc" }` or `{ "name": "desc" }`. Default sort property will be returned for every and point that have this functionality implemented.

<br><br>
Format of <b><i>error response</i></b> is:<br>
```c++
{
  "status": "error",
  "message": %string%,  // Mandatory part of response. Description of error that have occurred.
}
```

## <a name="authentication"></a> Authenticate with Humly Control Panel

Humly Control Panel is built on full stack JavaScript framework [Meteor](https://www.meteor.com/) which uses the DDP protocol to communicate. [Restivus](https://github.com/kahmali/meteor-restivus) package is used to expose these REST API endpoints.
To access API on your unencrypted application port (default 3000) you can use HTTP protocol or an encrypted HTTPS protocol on your encrypted application port (default 3002) over TLS v1.2. For example, API URL can be something like this:

- Unencrypted: http://localhost:3000/api/v1
- Encrypted: https://server.domain.tld:3002/api/v1

To authenticate, you can only use the username/password of an user of APIIntegration type. You can’t create user of APIIntegration type through Humly Control Panel. REST API is designed to be configured by pre-generated API user (defaultDevIntegrationUser) whose password (aka groupToken) can easily be found and copied under "Global Settings" in the Humly web interface. You can use this credential to create Client Group and other users that will be using this API.

### Request example

Following example is provided for REACT applications.
You can create Auth Resource file to communicate with REST API.

```js
import Axios from "axios";

export default class AuthResource {
    API_URL = "https://localhost:3002/api/v1";

    login(username, password) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
            },
        };

        return Axios.post(
            `${this.API_URL}/login`,
            { username, password },
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }

    logout(userId, authToken) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/logout`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }
}

```

To consume login REST API you can create something like this at your template file.

```js
import AuthResource from "./authResource";
// Other imports.

// class declaraction

    constructor(authResource = new AuthResource()) {
        this.authResource = authResource;
    }

    // Your template code.

    login() {
        this.authResource.login(
            "defaultDevIntegrationUser",
            "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz"
        ).then((response) => {
            // Store your "userId" and "authToken" to use it for future API calls.
            console.log("LOGIN --> response", response);
        }).catch((error) => {
            console.log("LOGIN --> error", error);
        });
    }

    logout() {
        this.authResource
            .logout(
                "1234abcd5678efgh",
                "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz"
            )
            .then((response) => {
                // Clear your "userId" and "authToken" values
                console.log("LOGOUT --> response", response);
            })
            .catch((error) => {
                console.log("LOGOUT --> error", error);
            });
    }
}

// Other code

```

### Response example

The userId is unique identifier of your user (in example above it is defaultDevIntegrationUser). The authToken is token for authenticating API requests. Both values are string.<br>
Response example for /login.

```json
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "authToken": "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz",
      "userId": "1234abcd5678efgh"
    }
  }
}
```

Response example for /logout.

```json
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "message": "You've been logged out!"
    }
  }
}
```

### Error response example

Error response for /login

```json
// Invalid username or password
{
  "responseStatus": 401,
  "responseData": {
    "status": "error",
    "message": "Wrong username or password!"
  }
}

// User lacks permission
{
  "responseStatus": 403,
  "responseData": {
    "status": "error",
    "message": "This type of user is not allowed to login!"
  }
}
```

Error response for /logout

```json
// User lacks permission
{
  "responseStatus": 403,
  "responseData": {
    "status": "error",
    "message": "You are not authorized!"
  }
}

// User not logged in
{
  "responseStatus": 401,
  "responseData": {
    "status": "error",
    "message": "You must be logged in to do this."
  }
}
```

## <a name="clientGroups"></a> Register a client group - <sub>`POST {HCP_URL}/api/v1/clientGroups`</sub>

This endpoint is available only for defaultDevIntegrationUser user. You can use it to register a new client group. Endpoint receives only one parameter name -name of client group (e.g. Humly Integration Group). Type of this parameter is string and it is mandatory to provide it. 

### Request example

You can create Client Group Resource file to communicate with REST API (REACT example).

```js
import Axios from "axios";

export default class ClientGroupsResource {
    API_URL = "https://localhost:3002/api/v1";

    createClientGroup(userId, authToken, clientGroupData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.post(
            `${this.API_URL}/clientGroups`,
            clientGroupData,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }
}

```

And then, you can put your requests in this way, for example.

```js
import ClientGroupsResource from "./clientGroupsResource";
// Other imports.

    constructor(clientGroupsResource = new ClientGroupsResource()) {
        this.clientGroupsResource = clientGroupsResource;
    }

    // Your template code.

    createClientGroup() {
        const clientGroupData = {
            name: "Humly Integration Group",
        };
        this.clientGroupsResource
            .createClientGroup(
                "1234abcd5678efgh",
                "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz",
                clientGroupData
            ).then((response) => {
                console.log("CREATE CLIENT GROUP --> response", response);
            }).catch((error) => {
                console.log("CREATE CLIENT GROUP --> error", error);
            });
    }
}

```

### Response example

Type of the `groupToken` is string.

```json
{
  "responseStatus": 201,
  "responseData": {
    "status": "success",
    "data": {
      "_id": "1234zvu9876",
      "groupName": "Humly Integration Group",
      "groupToken": "1234abcd5678efgh1234ijkl"
    }
  }
}
```

### Error response example

```json
// User group already exists
{
  "responseStatus": 500,
  "responseData": {
     "status": "error",
     "message": "Unable to register client group with that name. Client group already exists."
  }
}

// Not authorized
{
  "responseStatus": 401,
  "responseData": {
    "status": "error",
    "message": "You must be logged in to do this."
  }
}
```

## <a name="users"></a> Working with “users” API - <sub>`{HCP_URL}/api/v1/users/integration`</sub>

“Users” API is created for `defaultDevIntegrationUser`. All other users of `APIIntegration` type (users created through this API) can only see their profile. `defaultDevIntegrationUser` users, through this endpoint can create new users and see data of existing ones. 

### Parameters for `POST {HCP_URL}/api/v1/users/integration` endpoint
| Name         | Type   | Mandatory | Comment |
| ------------ | ------ | --------- | ------- |
| `name`       | String | Yes       | Name and username of `APIIntegration` user. |
| `groupToken` | String | Yes       | Group token of users group. You can use one created through “Register Client Group” endpoint. This string will serve as user’s password. |

### Requests example

You can create Users Resource file to use all Users related API-s. Provided example is for REACT applications.

```js
import Axios from "axios";

export default class UsersResource {
    API_URL = "https://localhost:3002/api/v1";

    createUser(userId, authToken, userData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.post(
            `${this.API_URL}/users/integration`,
            userData,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }

    getUsers(userId, authToken, queryParams) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {
                pageNumber: queryParams.pageNumber,
                pageSize: queryParams.pageSize,
                sort: queryParams.sort,
            },
        };

        return Axios.get(
            `${this.API_URL}/users/integration`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }

    getUser(userId, authToken, apiIntegrationUserId) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/users/integration/${apiIntegrationUserId}`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }
}

```

### Response example

```json
// Create user response
{
  "responseStatus": 201,
  "responseData": {
    "status": "success",
    "data": {
      "_id": "3333bbbb4444",
      "username": "Humly Integration User",
      "createdAt": "2019-08-01T14:01:18.626Z",
      "profile": {
        "clientGroup": "Humly Integration Group",
        "description": "",
        "groupToken": "1234abcd5678efgh1234ijkl",
        "name": "Humly Integration User",
        "originalToken": null,
        "pin": "",
        "rfid": "",
        "type": "APIIntegration",
      }
    }
  }
}

// Get all users response
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": [
      {
        "_id": "1111aaaa2222",
        "username": "defaultDevIntegrationUser",
        "createdAt": "2019-07-24T14:02:16.723Z",
        "profile": {
          "clientGroup": "DevAPIIntegration",
          "description": "",
          "groupToken": "1234567890abcdefghij",
          "name": "defaultDevIntegrationUser",
          "originalToken": null,
          "pin": "",
          "rfid": "",
          "type": "APIIntegration"
        }
      },
      {
        "_id": "3333bbbb4444",
        "username": "Humly Integration User",
        "createdAt": "2019-07-25T13:57:07.934Z",
        "profile": {
          "clientGroup": "Humly Integration Group",
          "description": "",
          "groupToken": "1234abcd5678efgh1234ijkl",
          "name": "Humly Integration User",
          "originalToken": null,
          "pin": "",
          "rfid": "",
          "type": "APIIntegration"
        }
      }
    ],
    "page": {
      "first": true,
      "last": true,
      "size": 10,
      "totalElements": 2,
      "totalPages": 1,
      "number": 1,
      "numberOfElements": 2
    },
    "sort": [
      {
        "property": "username",
        "direction": "ASC"
      }
    ]
  }
}

// Get one user response
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "_id": "1111aaaa2222",
      "username": "defaultDevIntegrationUser",
      "createdAt": "2019-07-24T14:02:16.723Z",
      "profile": {
        "clientGroup": "DevAPIIntegration",
        "description": "",
        "groupToken": "1234567890abcdefghij",
        "name": "defaultDevIntegrationUser",
        "originalToken": null,
        "pin": "",
        "rfid": "",
        "type": "APIIntegration"
      }
    }
  }
}
```

### Type of response data

| Name            | Type   | Comment |
| --------------- | ------ | ------- |
| `status`        | Number | Status of HTTP/HTTPS request. |
| `status`        | Boolean | Status of API response. Can have values: success or error. |
| `_id`           | String | Unique user’s identifier generated by system. |
| `username`      | String | User’s username. |
| `createdAt`     | String | Date when user is created. Date is provided in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). |
| `clientGroup`   | String | Name of User’s Client Group. |
| `description`   | String | Optional. |
| `groupToken`    | String | Group token of user’s group. This string can be used as user’s password. |
| `name`          | String | User’s name. |
| `originalToken` | String | User’s token. |
| `pin`           | String | User’s PIN for verifying and authentication actions. |
| `rfid`          | String | Value used for verifying and authentication actions when validation via RFID card is used. |
| `type`          | String | Type of a user. It defines user’s privileges. |

### Error response example

```json
// User already exists
{
  "responseStatus": 500,
  "responseData": {
     "status": "error",
     "message": " Username already exists."
  }
}

// Not authorized to create or to get users
{
  "responseStatus": 403,
  "responseData": {
    "status": "error",
    "message": "You are not authorized to access this resource!"
  }
}

// Not logged in
{
  "responseStatus": 401,
  "responseData": {
    "status": "error",
    "message": "You must be logged in to do this."
  }
}
```

## <a name="rooms"></a> Get rooms data - <sub>`{HCP_URL}/api/v1/rooms`</sub>

By using these endpoints, you can get information about all rooms, and single room. You can also check for available rooms, get room equipment, and report broken equipment.

### Query Parameters for "all rooms" endpoint

All query parameters are optional.

| Name               | Type    | Comment |
| ------------------ | ------- | ------- |
| `country`          | String  | Name of Country that rooms belong to. |
| `city`             | String  | Name of City that rooms belong to. If provided, then `country` parameter should be provided too.
| `building`         | String  | Name of Building that rooms belongs to. If provided, then `country` and `city` parameters should be provided too.
| `floor`            | String  | Name of Floor that rooms belong to. If provided, then `country`, `city` and `building` parameters should be provided too.
| `minNumberOfSeats` | Number  | Minimum required seats in room.
| `maxNumberOfSeats` | Number  | Maximum required seats in room.
| `pageNumber`       | Number  | Get rooms data starting from this page. Pages are count from 1.
| `pageSize`         | Number  | Limit size of rooms array (page size) that will be returned. Last page can be partially filled.
| `sort`             | String  | “Stringified” representation of JSON object. Format: <br>`{`<br>`  "any.property": "asc/desc",`<br>`  "any.property": asc/desc`<br>`}`<br>

### Request example

Following example is provided for REACT applications.
You can create Rooms Resource file to communicate with REST API.

```js
import Axios from "axios";

export default class RoomsResource {
    API_URL = "https://localhost:3002/api/v1";

    getAllRooms(userId, authToken, queryParams) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {
                country: queryParams.country,
                city: queryParams.city,
                building: queryParams.building,
                floor: queryParams.floor,
                minNumberOfSeats: queryParams.minNumberOfSeats,
                maxNumberOfSeats: queryParams.maxNumberOfSeats,
                pageNumber: queryParams.pageNumber,
                pageSize: queryParams.pageSize,
                sort: queryParams.sort,
            },
        };

        return Axios.get(
            `${this.API_URL}/rooms`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }

    getRoom(userId, authToken, roomId) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/rooms/${roomId}`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }

    getAvailableRooms(userId, authToken, queryParams) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {
                seats: queryParams.seats,
                startDate: queryParams.startDate,
                endDate: queryParams.endDate,
                location: queryParams.location,
                equipment: queryParams.equipment,
                customEquipment: queryParams.customEquipment,
                pageNumber: queryParams.pageNumber,
                pageSize: queryParams.pageSize,
                sort: queryParams.sort,
            },
        };

        return Axios.get(
            `${this.API_URL}/rooms/available`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }

    getRoomEquipment(userId, authToken, roomId) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/rooms/${roomId}/equipment`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }

    reportRoomEquipment(userId, authToken, roomId, equipmentData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.patch(
            `${this.API_URL}/rooms/${roomId}/equipment`,
            equipmentData,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }
}

```

### Response example

```json
// Get all rooms data
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": [
      {
        "_id": "1a2b3c4d5e6f7g8h",
        "name": "Room 1",
        "mail": "room1@humly.integration.com",
        "address": "room1@humly.integration.com",
        "id": "room1",
        "numberOfSeats": 0,
        "alias": "Room 1",
        "isActive": true,
        "isDeleted": false,
        "equipment": {
          "lights":  null,
          "projector":  null,
          "computer": null,
          "teleConference": null,
          "wifi": null,
          "whiteboard": null,
          "videoConference": null,
          "display": null,
          "minto": null,
          "ac": null,
          "information": null
        },
        "customEquipment": [
          {
            "name": "Gadget",
            "isChecked": true,
            "_id": "abc123def456ghi"
          }
        ],
        "structureId": "11223344aabbccdd",
        "userIds": [],
        "assigned": true
      },
      {
        "_id": "1i2j3k4l5m6n7o8p",
        "name": "Room 2",
        "mail": "room2@humly.integration.com",
        "address": "room2@humly.integration.com",
        "id": "room2",
        "numberOfSeats": 0,
        "alias": "room117",
        "isActive": true,
        "isDeleted": false,
        "equipment": {
          "lights": null,
          "projector": null,
          "computer": null,
          "teleConference": null,
          "wifi": null,
          "whiteboard": null,
          "videoConference": null,
          "display": null,
          "minto": null,
          "ac": null,
          "information": null
        },
        "customEquipment": [
          {
            "name": "Gadget",
            "isChecked": true,
            "_id": "abc123def456ghi"
          }
        ],
        "structureId": "11223344aabbccdd",
        "userIds": [],
        "assigned": true
      }
    ],
    "page": {
      "first": true,
      "last": true,
      "size": 10,
      "totalElements": 9,
      "totalPages": 1,
      "number": 1,
      "numberOfElements": 9
    },
    "sort": [
      {
        "property": "name",
        "direction": "ASC"
      }
    ]
  }
}

// Get one room data
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "_id": "1a2b3c4d5e6f7g8h",
      "name": "Room 1",
      "mail": "room1@humly.integration.com",
      "address": "room1@humly.integration.com",
      "id": "room1",
      "numberOfSeats": 0,
      "alias": "Room 1",
      "isActive": true,
      "isDeleted": false,
      "equipment": {
        "lights":  null,
        "projector":  null,
        "computer": null,
        "teleConference": null,
        "wifi": null,
        "whiteboard": null,
        "videoConference": null,
        "display": null,
        "minto": null,
        "ac": null,
        "information": null
      },
      "customEquipment": [
        {
          "name": "Gadget",
          "isChecked": true,
          "_id": "abc123def456ghi"
        }
      ],
      "structureId": "11223344aabbccdd",
      "userIds": [],
      "assigned": true
    }
  }
}

// Get room equipment
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "equipment": {
        "lights": false,
        "projector": false,
        "computer": null,
        "teleConference": true,
        "wifi": true,
        "whiteboard": false,
        "videoConference": true,
        "display": true,
        "minto": true,
        "ac": true,
        "information": null
      },
      "customEquipment": [
        {
          "name": "Gadget",
          "isChecked": true,
          "_id": "abc123def456ghi"
        }
      ]
    }
  }
}
```

### Type of response data

| Name              | Type    | Comment |
| ----------------- | ------- | ------- |
| `responseStatus`  | Number  | Status of HTTP/HTTPS request. |
| `status`          | Boolean | Status of API response. Can have values: success or error. |
| `_id`             | String  | Unique Room identifier. |
| `name`            | String  | Room name. |
| `mail`            | String  | Email that is related to this room. |
| `address`         | String  | Room address. |
| `id`              | String  | Unique Room identified on booking system. |
| `numberOfSeats`   | Number  | Number of seats in room. |
| `alias`           | String  | Room alias. |
| `isActive`        | Boolean | If disabled, Room can’t be used. |
| `isDeleted`       | Boolean | Flag showing that Room is deleted. |
| `lights`          | Boolean | Predefined Room equipment. Point is there lights in Room. |
| `projector`       | Boolean | Predefined Room equipment. Point is there projector Room. |
| `computer`        | Boolean | Predefined Room equipment. Point is there computer in Room. |
| `teleConference`  | Boolean | Predefined Room equipment. Point is there tele conference device in Room. |
| `wifi`            | Boolean | Predefined Room equipment. Point is there Wireless connection available for Room users. |
| `whiteboard`      | Boolean | Predefined Room equipment. Point is there whiteboard in Room. |
| `videoConference` | Boolean | Predefined Room equipment. Point is there video conference device in Room. |
| `display`         | Boolean | Predefined Room equipment. Point is there display in Room. |
| `minto`           | Boolean | Predefined Room equipment. Point is there Minto speaker in Room. |
| `ac`              | Boolean | Predefined Room equipment. Point is there air conditioner in Room. |
| `information`     | String  | Information about Room. |
| `customEquipment` | Array   | Array of Objects. Represent the name and presence of device present in Room. |
| `structureId`     | String  | Unique structure identifier. |
| `userIds`         | Array   | Array of Strings. Array of user ids assigned to this Room. |
| `assigned`        | Boolean | Is this Room assigned to any Booking device? |

### Searching for available rooms

By using this endpoint, you can find suitable room that you can book. It will return rooms that fully match your needs, and rooms that partially match.

### Query Parameters for "available rooms" endpoint

All query parameters are optional.

| Name              | Type   | Comment |
| ----------------- | ------ | ----------- |
| `seats`           | Number | Number of seats that you need. Rooms that have exact number of seats or above will be returned as exact match. |
| `startDate`       | String | Rooms that are available in current day after specified start date. Date is provided in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). |
| `endDate`         | String | Rooms that are available in current day before specified end date. Date is provided in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). |
| `location`        | String | This parameter should be use if you are searching for room at exact location. Parameter should be provided as “stringified” representation of JSON object. Format: <br>`{`<br>`    "countryId": "aaa111",`<br>`    "cityId": "bbb222",`<br>`    "buildingId": "ccc333",`<br>`    "floorId": "ddd444"`<br>`}`<br>You can provide part of object. If you for example looking for rooms in certain country, then you can provide: <br>`{`<br>`  "countryId": "aaa111"`<br>`}`<br>as location parameter.<br>Rooms that are located at exact location will be returned as part of exact match list. |
| `equipment`       | String | This parameter should be use if you are searching for room with specific equipment. Rooms that have all wanted equipment will be return as exact match, other rooms will be listed in partially match. Parameter should be provided as “stringified” representation of JSON object. Format: <br>`{`<br>`  "lights": true,`<br>`  "projector": true,`<br>`  "computer": true`<br>`}`<br>List only equipment that you need. |
| `customEquipment` | String | This parameter should be use if you are searching for room with specific custom equipment. Rooms that have all wanted custom equipment will be return as exact match, other rooms will be listed in partially match. Parameter should be provided as “stringified” representation of JSON object. Format: <br>`[{`<br>`  "_id": "eee555",`<br>`  "isChecked": true`<br>`}]`<br>List only equipment that you need. |
| `pageNumber`      | Number | Get rooms data starting from this page. Pages are count from 1.
| `pageSize`        | Number | Limit size of rooms array (page size) that will be returned. Last page can be partially filled.
| `sort`            | String | “Stringified” representation of JSON object. Format: <br>`{`<br>`  "any.property": "asc/desc",`<br>`  "any.property": asc/desc`<br>`}`<br>

### Request example

You can use some similar code to find available room.

```js
    getAvailableRooms(userId, authToken) {
        this.roomsResource
            .getAvailableRooms(
                userId,
                authToken,
                {
                    seats: 5,
                    location: "{ \"countryId\": \"aaa111\", \"cityId\": \"bbb222\", \"buildingId\": \"ccc333\", \"floorId\": \"ddd4444\"}",
                    equipment: "{ \"lights\": true,\"projector\": true,\"computer\": true }",
                    customEquipment: "[{ \"_id\": \"eee555\", \"isChecked\": true }]",
                }
            ).then((response) => {
                console.log("GET AVAILABLE ROOMS --> response", response);
            }).catch((error) => {
                console.log("GET AVAILABLE ROOMS --> error", error);
            });
    }

```

### Response example

```json
// Get available rooms
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "fullMatchArray": [
        {
          "_id": "1a2b3c4d5e6f7g8h",
          "name": "Room 1",
          "mail": "room1@humly.integration.com",
          "address": "room1@humly.integration.com",
          "id": "room1",
          "numberOfSeats": 0,
          "alias": "Room 1",
          "isActive": true,
          "isDeleted": false,
          "equipment": {
            "lights":  null,
            "projector":  null,
            "computer": null,
            "teleConference": null,
            "wifi": null,
            "whiteboard": null,
            "videoConference": null,
            "display": null,
            "minto": null,
            "ac": null,
            "information": null
          },
          "customEquipment": [
            {
              "name": "Gadget",
              "isChecked": true,
              "_id": "abc123def456ghi"
            }
          ],
          "structureId": "11223344aabbccdd",
          "userIds": [],
          "assigned": true,
        }
      ],
      "partialMatchArray": []
    },
    "page": {
      "first": true,
      "last": true,
      "size": 10,
      "totalElements": 1,
      "totalPages": 1,
      "number": 1,
      "numberOfElements": 1
    },
    "sort": [
      {
        "property": "name",
        "direction": "ASC"
      }
    ]
  }
}
```

### Reporting broken or fixed equipment

By using this endpoint, you can report that certain room equipment is broken or fixed.  It will return new equipment status for given room.

### Body Parameters for reporting broken or fixed equipment

All query parameters are optional.

| Name              | Type   | Comment |
| ----------------- | -------| ------- |
| `equipment`       | String | This parameter should be used to report broken or fixed equipment for given room. Parameter should be provided as “stringified” representation of JSON object. Format: <br>`{`<br>`  "lights": true,`<br>`  "projector": false,`<br>`  "computer": true`<br>`}`<br>Room equipment will be reported as fixed by specifying “true” as their value or broken if “false” is provided. List only equipment that should change state from broken to fixed, or vice versa. |
| `customEquipment` | String | This parameter should be used to report broken or fixed custom equipment for given room. Parameter should be provided as “stringified” representation of JSON object. Format: <br>`[{`<br>`    "name": "Gadget",`<br>`    "isChecked": false`<br>`  }]`<br>Room custom equipment will be reported as fixed by specifying “true” as value of “isChecked” parameter or broken if “false” is provided. List only custom equipment that should change state from broken to fixed, or vice versa. |

### Request example

You can report broken or fixed equipment by executing some code like this.

```js
    reportEquipment(userId, authToken) {
        this.roomsResource
            .reportRoomEquipment(
                userId,
                authToken,
                "1a2b3c4d5e6f7g8h",
                {
                    equipment: "{ \"lights\": false,\"projector\": false }",
                    customEquipment: "[{ \"name\": \"Gadget\", \"isChecked\": true }]",
                }
            ).then((response) => {
                console.log("REPORT EQUIPMENT --> response", response);
            }).catch((error) => {
                console.log("REPORT EQUIPMENT --> error", error);
            });
    }

```

### Response example

```json
// Report broken or fixed equipment
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "equipment": {
        "lights": false,
        "projector": false,
        "computer": null,
        "teleConference": true,
        "wifi": true,
        "whiteboard": true,
        "videoConference": true,
        "display": true,
        "minto": true,
        "ac": true,
        "information": null
      },
      "customEquipment": [
        {
          "name": "Gadget",
          "isChecked": false,
          "_id": "abc123def456ghi"
        }
      ],
      "message": "Equipment for room Room 1 has been reported through API.\n\nEquipment reported as broken: \n• lights\n• Gadget\n\nEquipment reported as fixed: \n• whiteboard"
    }
  }
}
```

## <a name="bookings"></a> Working with “bookings” API - <sub>`{HCP_URL}/api/v1/bookings`</sub>

By using these endpoints, you can get information about your bookings. You can create, update, or delete booking

### Request example

Following example is provided for REACT applications.
You can create Bookings Resource file to communicate with REST API.

```js
import Axios from "axios";

export default class BookingsResource {
    API_URL = "https://localhost:3002/api/v1";

    getOrganizerBookings(userId, authToken, queryParams) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {
                organizerUser: userId,
                startDate: queryParams.startDate,
                endDate: queryParams.endDate,
                pageNumber: queryParams.pageNumber,
                pageSize: queryParams.pageSize,
                sort: queryParams.sort,
            },
        };

        return Axios.get(
            `${this.API_URL}/bookings`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }

    createBooking(userId, authToken, bookingData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.post(
            `${this.API_URL}/bookings`,
            bookingData,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }

    patchBooking(userId, authToken, bookingId, bookingData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.patch(
            `${this.API_URL}/bookings/${bookingId}`,
            bookingData,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }

    deleteBooking(userId, authToken, bookingId) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.delete(
            `${this.API_URL}/bookings/${bookingId}`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }

    checkInBooking(userId, authToken, bookingId) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {
                bookingId,
            },
        };

        return Axios.put(
            `${this.API_URL}/bookings/checkedIn`,
            null,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }
}

```

## <a name="getMeetings"></a> Get organizer meetings – <sub>`GET {HCP_URL}/api/v1/bookings`</sub>

This endpoint is used to get meetings organized by given user.

### Query Parameters

| Name            | Type   | Mandatory | Comment |
| --------------- | ------ | --------- | ------- |
| `organizerUser` | String | Yes       | Unique identifier of the user. `userId` string returned by login. Users can see only their own bookings. |
| `startDate`     | String | No        | Limits returned meetings data to include meetings that have start date greater or equal to provided date. If this parameter is not provided this endpoint will return all bookings for this user from start of the ongoing day. Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). |
| `endDate`       | String | No        | Limits returned meetings data to include meetings that have end date lower than provided date. If this parameter is not provided this endpoint will return all bookings for this user until end of the ongoing day. Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). |
| `pageNumber`    | Number | No        | Get rooms data starting from this page. Pages are count from 1.
| `pageSize`      | Number | No        | Limit size of rooms array (page size) that will be returned. Last page can be partially filled.
| `sort`          | String | No        | “Stringified” representation of JSON object. Format: <br>`{`<br>`  "any.property": "asc/desc",`<br>`  "any.property": asc/desc`<br>`}`<br>

### Request example

```js
    getOrganizerBookings() {
        const queryData = {
          startDate: "2019-09-01T12:00:00+00:00",
          endDate: null,
        };
        this.bookingsResource
            .getOrganizerBookings(
                "1234abcd5678efgh",
                "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz",
                queryData
            )
            .then((response) => {
                console.log("BOOKINGS FOR ORGANIZER --> response", response);
            }).catch((error) => {
                console.log("BOOKINGS FOR ORGANIZER --> error", error);
            });
    }

```

### Response example

```json
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": [
      {
        "_id": "1a2b3c4d5e6f7g8h",
        "id": "ABCDEFGHIJKL1234567890ABCDEFGHIJKLMN1234567890ABCDEFGHIJKLMN",
        "changeKey": "ABCDEFGHIJKL1234567890AB",
        "booking": {
          "startDate": "2019-09-01T12:00:00+00:00",
          "endDate": "2019-09-01T12:30:00+00:00",
          "location": "Humly-Room",
          "startTime": "12:00",
          "endTime": "12:30",
          "onlyDate": "2019-09-01",
          "dateForStatistics": "2019-09-01T12:00:00+00:00",
          "createdBy": {
            "name": "HumlyIntegrationUser",
            "mail": "HumlyIntegrationUser"
          },
          "dateCreated": "2019-09-01T11:55:05+00:00",
          "endType": null,
          "confirmed": false,
          "subject": "Humly meeting",
          "equipment": null,
          "freeBusyStatus": "Busy",
          "showConfirm": false,
          "numberOfExpectedReminderResponses": null,
          "numberOfReceivedReminderResponses": null,
          "sendReminderEmailCheck": null,
          "sendReminderEmailCheckTime": null,
          "numberOfExpectedCancellationResponses": null,
          "numberOfReceivedCancellationResponses": null,
          "sendCancellationEmailCheck": null,
          "sendCancellationEmailCheckTime": null,
          "reminderEmailSent": null,
          "cancellationEmailSent": null,
          "fetchedOrganizer": null
        }
      }
    ],
    "page": {
      "first": true,
      "last": true,
      "size": 10,
      "totalElements": 1,
      "totalPages": 1,
      "number": 1,
      "numberOfElements": 1
    },
    "sort": [
      {
        "property": "booking.startDate",
        "direction": "ASC"
      }
    ]
  }
}
```
### Type of response data

| Name                | Type    | Comment |
| ------------------- | ------- | ------- |
| `responseStatus`    | Number  | Status of HTTP/HTTPS request. |
| `status`            | Boolean | Status of API response. Can have values: success or error. |
| `_id`               | String  | Unique Room identifier. |
| `id`                | String  | Booking system unique identifier. |
| `changeKey`         | String  | Booking system change key value. |
| `startDate`         | String  | UTC meeting start date in ISO date format. |
| `endDate`           | String  | UTC meeting end date in ISO date format. |
| `location`          | String  | Room name on booking system. |
| `startTime`         | String  | Meeting start time in 24 hours format (HH24:MI). |
| `endTime`           | String  | Meeting end time in 24 hours format (HH24:MI). |
| `onlyDate`          | String  | Date of meeting in YYYY-MM-DD format. |
| `dateForStatistics` | String  | Date used for statistics processing. |
| `name`              | String  | Name of user that booked a meeting. |
| `mail`              | String  | Email of user that booked a meeting if available, otherwise same as name. |
| `dateCreated`       | String  | UTC date of meeting creation in ISO date format. |
| `endType`           | String  | Description of meeting end event. |
| `confirmed`         | Boolean | `true` if meeting is checked in. |
| `subject`           | String  | Meeting subject. |
| `freeBusyStatus`    | String  | Booking system specific value. |
| `showConfirm`       | Boolean | `true` if check in functionality is enabled. |
| `sendReminderEmailCheck` | Boolean | `true` if Send email remainder functionality is enabled. |
| `sendReminderEmailCheckTime` | Number  | Used to calculate a time when to send check in remainder email. Provided in number of minutes before meeting start. |
| `sendCancellationEmailCheck` | Boolean | `true` if email should be send to meeting organizer after meeting is automatically deleted after checking period. |
| `reminderEmailSent` | Boolean | `true` if remainder email has been sent to organizer 5 minutes before meeting start. |
| `cancellationEmailSent` | Boolean | `true` if cancellation email has been sent to organizer after meeting is automatically deleted after check in period. |
| `fetchedOrganizer`  | String  | Organizer fetched from booking system. |

## <a name="createMeeting"></a> Create a meeting – <sub>`POST {HCP_URL}/api/v1/bookings`</sub>

This endpoint is used to create a new meeting.

### Parameters

| Name        | Type   | Mandatory | Comment |
| ----------- | ------ | --------- | ------- |
| `roomId`    | String | Yes       | Unique identifier of the room `_id` string in Room data. |
| `startDate` | String | Yes       | Meeting start date in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). |
| `endDate`   | String | Yes       | Meeting end date in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). |
| `subject`   | String | No        | Meeting subject. |

### Request example

```js
    createBooking() {
        const bookingData = {
            roomId: "1a2b3c4d5e6f7g8h",
            startDate: "2019-09-01T10:00:00+00:00",
            endDate: "2019-09-01T11:00:00+00:00",
            subject: "Humly Open API Booking Example",
        };
        this.bookingsResource.createBooking(
            "1234abcd5678efgh",
            "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz",
            bookingData
        ).then((response) => {
            console.log("CREATE BOOKING --> response", response);
        }).catch((error) => {
            console.log("CREATE BOOKING --> error", error);
        });
    }

```

### Response example

The id is unique identifier of newly created meeting. id refers to _id in bookings endpoint.

``` json
{
  "responseStatus": 201,
  "responseData": {
    "status": "success",
    "data": {
      "_id": "1a2b3c4d5e6f7g8h",
      "id": "ABCDEFGHIJKL1234567890ABCDEFGHIJKLMN1234567890ABCDEFGHIJKLMN",
      "changeKey": "ABCDEFGHIJKL1234567890AB",
      "booking": {
        "startDate": "2019-09-01T12:00:00+00:00",
        "endDate": "2019-09-01T12:30:00+00:00",
        "location": "Humly-Room",
        "startTime": "12:00",
        "endTime": "12:30",
        "onlyDate": "2019-09-01",
        "dateForStatistics": "2019-09-01T12:00:00+00:00",
        "createdBy": {
          "name": "HumlyIntegrationUser",
          "mail": "HumlyIntegrationUser"
        },
        "dateCreated": "2019-09-01T11:55:05+00:00",
        "endType": null,
        "confirmed": false,
        "subject": "Humly meeting",
        "equipment": null,
        "freeBusyStatus": "Busy",
        "showConfirm": false,
        "numberOfExpectedReminderResponses": null,
        "numberOfReceivedReminderResponses": null,
        "sendReminderEmailCheck": null,
        "sendReminderEmailCheckTime": null,
        "numberOfExpectedCancellationResponses": null,
        "numberOfReceivedCancellationResponses": null,
        "sendCancellationEmailCheck": null,
        "sendCancellationEmailCheckTime": null,
        "reminderEmailSent": null,
        "cancellationEmailSent": null,
        "fetchedOrganizer": null
      }
    }
  }
}
```

### Error response example

```json
// A meeting already exists
{
  "responseStatus": 400,
  "responseData": {
    "status": "error",
    "message": "Unfortunately another user just booked this room"
  }
}
```

## <a name="updateMeeting"></a> Update a meeting - <sub>`PATCH {HCP_URL}/api/v1/bookings/:bookingId`</sub>

This endpoint is used to update existing meetings. Through it you can update meeting start time, end time and subject.

### Parameters

| Name        | Type   | Mandatory | Comment |
| ----------- | ------ | --------- | ------- |
| `startDate` | String | Yes       | Meeting start date in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). |
| `endDate`   | String | Yes       | Meeting end date in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). |
| `subject`   | String | No        | Meeting subject. |

### Request example

```js
    patchBooking() {
        const bookingData = {
            startDate: "2019-09-01T11:00:00+00:00",
            endDate: "2019-09-01T12:00:00+00:00",
            subject: "Humly Open API Booking Example Patched",
        };
        this.bookingsResource.patchBooking(
            "1234abcd5678efgh",
            "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz",
            "1x1x2y2y3z3z",
            bookingData
        ).then((response) => {
            console.log("PATCH BOOKING --> response", response);
        }).catch((error) => {
            console.log("PATCH BOOKING --> error", error);
        });
    }

```

### Response example

```json
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "_id": "1a2b3c4d5e6f7g8h",
      "id": "ABCDEFGHIJKL1234567890ABCDEFGHIJKLMN1234567890ABCDEFGHIJKLMN",
      "changeKey": "ABCDEFGHIJKL1234567890AB",
      "booking": {
        "startDate": "2019-09-01T12:00:00+00:00",
        "endDate": "2019-09-01T14:00:00+00:00",
        "location": "Humly-Room",
        "startTime": "12:00",
        "endTime": "14:00",
        "onlyDate": "2019-09-01",
        "dateForStatistics": "2019-09-01T12:00:00+00:00",
        "createdBy": {
          "name": "HumlyIntegrationUser",
          "mail": "HumlyIntegrationUser"
        },
        "dateCreated": "2019-09-01T11:55:05+00:00",
        "endType": null,
        "confirmed": false,
        "subject": "Humly meeting",
        "equipment": null,
        "freeBusyStatus": "Busy",
        "showConfirm": false,
        "numberOfExpectedReminderResponses": null,
        "numberOfReceivedReminderResponses": null,
        "sendReminderEmailCheck": null,
        "sendReminderEmailCheckTime": null,
        "numberOfExpectedCancellationResponses": null,
        "numberOfReceivedCancellationResponses": null,
        "sendCancellationEmailCheck": null,
        "sendCancellationEmailCheckTime": null,
        "reminderEmailSent": null,
        "cancellationEmailSent": null,
        "fetchedOrganizer": null
      }
    }
  }
}
```

### Error response example

```json
// Error while extending meeting. Conflict with another existing meeting.
{
  "responseStatus": 400,
  "responseData": {
    "message": "MeetingInvalidExtend [400]",
    "status": "failure"
  }
}
```

## <a name="deleteMeeting"></a> Delete a meeting - <sub>`DELETE {HCP_URL}/api/v1/bookings/:bookingId`</sub>

Through this endpoint you can delete existing meetings.

### Request example

```js
    deleteBooking() {
        this.bookingsResource
            .deleteBooking(
                "1234abcd5678efgh",
                "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz",
                "1x1x2y2y3z3z"
            )
            .then((response) => {
                console.log("DELETE BOOKING --> response", response);
            })
            .catch((error) => {
                console.log("DELETE BOOKING --> error", error);
            });
    }

```

### Response example

```json
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "_id": "1a2b3c4d5e6f7g8h",
      "id": "ABCDEFGHIJKL1234567890ABCDEFGHIJKLMN1234567890ABCDEFGHIJKLMN=",
      "changeKey": "ABCDEFGHIJKL1234567890AB",
      "booking": {
        "location": "Humly-Room",
        "startDate": "2019-09-01T12:00:00+00:00",
        "endDate": "2019-09-01T12:30:00+00:00",
        "dateForStatistics": "2019-09-01T12:00:00+00:00",
        "subject": "Humly meeting",
        "body": "Humly-Room",
        "onlyDate": "2019-09-01",
        "startTime": "12:0",
        "endTime": "12:30",
        "createdBy": {
          "name": "HumlyIntegrationUser",
          "mail": "HumlyIntegrationUser"
        },
        "sensitivity": "Normal",
        "confirmed": false,
        "showConfirm": false,
        "numberOfExpectedReminderResponses": null,
        "numberOfReceivedReminderResponses": null,
        "sendReminderEmailCheck": null,
        "sendReminderEmailCheckTime": null,
        "numberOfExpectedCancellationResponses": null,
        "numberOfReceivedCancellationResponses": null,
        "sendCancellationEmailCheck": null,
        "sendCancellationEmailCheckTime": null,
        "reminderEmailSent": null,
        "cancellationEmailSent": null,
        "fetchedOrganizer": null,
        "endType": null,
        "freeBusyStatus": "Busy",
        "isDeleted": true
      }
    }
  }
}
```

## <a name="checkInMeeting"></a> Check-in a meeting - `PUT {HCP_URL}/api/v1/bookings/checkedIn?bookingId=:bookingId`

This endpoint is used to check-in an existing meeting.

### Request example

```js
    checkInBooking() {
        this.bookingsResource
            .checkInBooking(
                "1234abcd5678efgh",
                "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz",
                "1x1x2y2y3z3z"
            )
            .then((response) => {
                console.log("CHEK IN BOOKING --> response", response);
            })
            .catch((error) => {
                console.log("CHEK IN BOOKING --> error", error);
            });
    }

```

### Response example

```json
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "_id": "1a2b3c4d5e6f7g8h",
      "id": "ABCDEFGHIJKL1234567890ABCDEFGHIJKLMN1234567890ABCDEFGHIJKLMN=",
      "changeKey": "ABCDEFGHIJKL1234567890AB",
      "booking": {
        "location": "Humly-Room",
        "startDate": "2019-09-01T12:00:00+00:00",
        "endDate": "2019-09-01T12:30:00+00:00",
        "dateForStatistics": "2019-09-01T12:00:00+00:00",
        "subject": "Humly meeting",
        "body": "Humly-Room",
        "onlyDate": "2019-09-01",
        "startTime": "12:0",
        "endTime": "12:30",
        "createdBy": {
          "name": "HumlyIntegrationUser",
          "mail": "HumlyIntegrationUser"
        },
        "sensitivity": "Normal",
        "confirmed": true,
        "showConfirm": false,
        "numberOfExpectedReminderResponses": null,
        "numberOfReceivedReminderResponses": null,
        "sendReminderEmailCheck": null,
        "sendReminderEmailCheckTime": null,
        "numberOfExpectedCancellationResponses": null,
        "numberOfReceivedCancellationResponses": null,
        "sendCancellationEmailCheck": null,
        "sendCancellationEmailCheckTime": null,
        "reminderEmailSent": null,
        "cancellationEmailSent": null,
        "fetchedOrganizer": null,
        "endType": null,
        "freeBusyStatus": "Busy",
        "timeOfConfirmation": "2019-09-01T11:55:00+00:00"
      }
    }
  }
}
```

### Error response example

```json
// Booking is already confirmed
{
  "responseStatus": 500,
  "responseData": {
    "status": "error",
    "message": "Booking has already been confirmed!"
  }
}

// Wrong booking id
{
  "responseStatus": 404,
  "responseData": {
    "status": "error",
    "message": "Booking does not exist!: non-existing-meeting-id"
  }
}
```

## <a name="structures"></a> Get structures data - `GET {HCP_URL}/api/v1/structures`

### Request example

You can create Structures Resource file to communicate with REST API (REACT example).

```js
import Axios from "axios";

export default class StructuresResource {
    API_URL = "https://localhost:3002/api/v1";

    getAllStructures(userId, authToken, queryParams) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {
                pageNumber: queryParams.pageNumber,
                pageSize: queryParams.pageSize,
                sort: queryParams.sort,
            },
        };

        return Axios.get(
            `${this.API_URL}/structures`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }
}

```

### Response example

```json
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": [
      {
        "_id": "1234567890",
        "name": "Humly",
        "level": 1,
        "parent": 0,
        "cities": [
          {
            "_id": "abcdefghijkl",
            "name": "Rest",
            "level": 2,
            "parent": "1234567890",
            "buildings": [
              {
                "_id": "0987654321",
                "name": "Integration",
                "level": 3,
                "parent": "abcdefghijkl",
                "floors": [
                  {
                    "_id": "lkjihgfedcba",
                    "name": "Level 1",
                    "level": 4,
                    "parent": "0987654321",
                    "roomIds": [
                      "abcd1234efgh5678",
                      "1234abcd5678efgh",
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "page": {
      "first": true,
      "last": true,
      "size": 10,
      "totalElements": 1,
      "totalPages": 1,
      "number": 1,
      "numberOfElements": 1
    },
    "sort": [
      {
        "property": "name",
        "direction": "ASC"
      }
    ]
  }
}
```
### Type of response data

| Name                | Type    | Comment |
| ------------------- | ------- | ------- |
| `responseStatus`    | Number  | Status of HTTP/HTTPS request. |
| `status`            | Boolean | Status of API response. Can have values: success or error. |
| `_id`               | String  | Structure unique identifier. |
| `name`              | String  | Name of Country, City, Building or Floor. |
| `level`             | String  | Values from 1 to 4 depicting Country, City, Building or Floor. Value 1 represent that object holds Country data. Value 2 is for City etc. |
| `parent`            | String  | Unique identifier of parent. Referencing parents _id property. |
| `cities`            | Array   | Array of Cities objects. |
| `buildings`         | Array   | Array of Building objects. |
| `floors`            | Array   | Array of Flor objects. |
| `roomIds`           | Array   | Array of room unique identifiers that are assigned to floor. |
