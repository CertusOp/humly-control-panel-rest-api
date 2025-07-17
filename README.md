# Humly Control Panel API docs

API documentation for Humly Control Panel version: `v1.0.x`

- [Introduction](#introduction)
- [Response content](#responseContent)
- [Authenticate with Humly Control Panel (HCP) API](#authentication)
- [Get rooms data - `{API_URL}/rooms`](#rooms)
- [Get desks data - `{API_URL}/desks`](#desks)
- [Working with “bookings” API - `{API_URL}/bookings`](#bookings)
- [Get organizer meetings – `GET {API_URL}/bookings`](#getMeetings)
- [Create a meeting - `POST {API_URL}/bookings`](#createMeeting)
- [Update a meeting - `PATCH {API_URL}/bookings/:bookingId`](#updateMeeting)
- [Delete a meeting - `DELETE {API_URL}/bookings/:bookingId`](#deleteMeeting)
- [Check-in a meeting - `PUT {API_URL}/bookings/checkedIn?bookingId=:bookingId`](#checkInMeeting)
- [Get structures data - `GET {API_URL}/structures`](#structures)
- [Get devices data - `{API_URL}/devices`](#devices)
- [Working with sensors - `{API_URL}/sensors`](#sensors)
- [Managing sensor readings - `{API_URL}/sensor-readings`](#sensorReadings)
- [Get visitor screens - `{{API_URL}/visitor-screens}`](#getVisitorScreens)

## <a name="introduction"></a> Introduction

Welcome and thank you for using Humly Control Panel API!
This documentation provides a detailed overview of the available API endpoints for integrating with the Humly Control Panel (HCP), including parameter specifications and usage guidelines. You'll also find basic usage examples written in React using the Axios library.

> 👉 **Disclaimer!** The code examples provided in this documentation are intended as basic templates. You should adapt and modify them to fit your specific production requirements.

The Humly Control Panel is the server-side software used to manage and monitor Humly devices. These devices offer room booking functionalities, allowing users to display, book, and confirm reservations directly through them.

HCP acts as a central data repository, ensuring synchronization across all connected devices. The platform is built on the full-stack JavaScript framework [Meteor](https://www.meteor.com/), which uses the DDP (Distributed Data Protocol) to handle real-time communication between clients and the server. 

## <a name="responseContent"></a> Response content

All responses from the Humly Control Panel API follow a standardized structure. There are two main types of responses you can expect:

- Success Response
- Error Response

### Success Response

A typical success response follows this format:
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
In the examples throughout this document, you will see a <i>responseData</i> object included as part of the API responses. If an endpoint returns an array of results, it typically supports pagination and sorting options.

<b>Pagination</b> is controlled using two query parameters:

- `pageNumber`: Specifies which page of results to retrieve. Default is 1.
- `pageSize`: Limits the maximum number of results returned per page. Default is 10.

If the endpoint supports pagination, a `page` object (as documented above) will always be included in a successful response.

<b>Sorting</b> is handled via the `sort` query parameter, which should be a stringified JSON object. Each key-value pair represents a sorting rule, where:

- <i>Key</i>: The name of the property in the response data (use dot notation for nested properties)
- <i>Value</i>: Sorting direction — either "asc" (ascending) or "desc" (descending)

<b>Examples:</b>

```json
{ "booking.location": "asc", "booking.startDate": "desc" }
```
```json
{ "name": "desc" }
```
If an endpoint supports sorting, a default sort property will be applied and returned unless explicitly overridden.

### Error Response

An error response from the Humly Control Panel API follows this format:
```c++
{
  "status": "error",
  "message": %string%,  // Mandatory part of response. Description of error that have occurred.
}
```

## Technical Overview & Access

The Humly Control Panel is built on the full-stack JavaScript framework [Meteor](https://www.meteor.com/), which communicates using the DDP (Distributed Data Protocol).

### API Access
You can access the API using the HTTPS protocol. The base URL of the API (hereafter also referred to as {API_URL}) follows the format:
`https://{FQDN}:{PORT}/api/v1`
where each placeholder represents:

- <b>{FQDN}</b>:
  - In a <b>cloud environment</b>, this is the domain name of the HCP instance, e.g. `123456.humly.cloud`
  - In an <b>on-prem environment</b>, this is the Fully Qualified Domain Name (FQDN) of the server running HCP, e.g. `hcp.local.domain`

- <b>{PORT}</b>:
  - In the <b>cloud environment</b>, this value is not needed and should be omitted along with the colon (`:`)
  - In the <b>on-prem environment</b>, the port depends on the protocol used: HTTP → port `3000` , HTTPS → port `3002` (PROMJENITI, CUSTOM PORT)

#### Examples of base URLs:
- <i>Cloud HCP instance</i>: `https://123456.humly.cloud/api/v1`
- <i>On-prem HCP instance</i>: `https://hcp.local.domain/api/v1`

#### Usage in code
In the code examples below, the base URL is stored in the `API_URL` constant, as in the following line:

`const API_URL = "https://123456.humly.cloud/api/v1";`

##### Constructing full endpoint URLs
The final endpoint URL is formed by adding the specific endpoint path to the base URL. Essentially, you join {API_URL} and the endpoint path with a forward slash (/) in between.

For example, if your base URL ({API_URL}) is `https://123456.humly.cloud/api/v1`:
- The login endpoint URL becomes: `https://123456.humly.cloud/api/v1/login`
- The rooms endpoint URL becomes: `https://123456.humly.cloud/api/v1/rooms`
- The bookings endpoint URL becomes: `https://123456.humly.cloud/api/v1/bookings`

This way of constructing URLs helps ensure that your API requests always target the correct endpoints.

## <a name="authentication"></a> Authenticate with Humly Control Panel (HCP) API

Authentication is handled using a username and password associated with a valid user account.
User accounts must be created in advance through the Humly Control Panel (HCP). The username must be in the format of an email address. Upon user creation, the password will be sent to the email address used as username. Since the password cannot be viewed or retrieved through HCP, the one received via email must be used for authentication.

There are different levels of access to the API depending on the user’s profile type.

Make sure to assign the appropriate profile type when creating a user, based on the level of access required.

#### Users with Guest and User Profile Types 
Accounts with the profile type set to <b>"User"</b> or <b>"Guest"</b> have limited access and are restricted from calling certain API endpoints.
These user types are intended for basic integration scenarios, where users interact only with their own data. They are suitable for embedding basic booking functionality into third-party applications or user-specific dashboards.

Such users can, for example:
- Create and manage their own bookings
- Retrieve a list of their own bookings
- Retrieve a list of other users' bookings, but with limited data included, configured by administrator
- Retrieve information about resources

They cannot modify other users’ data or perform system-level operations. Their permissions are scoped to what they personally own.

> 👉 **Note!** Use these users when basic integration with HCP is required.

#### Users with "Global Admin" profile type
The <b>"Global Admin"</b> profile type is intended for users who require complete access to the Humly Control Panel (HCP) API.
It enables interaction with all API endpoints, making it suitable for full-scale integrations and administrative automation. 

An account with this profile type can, for example:
- Retrieve information about all resources
- Retrieve bookings created by any user
- Create and manage bookings on behalf of other users
- Create and manage their own bookings
- Receive data related to devices
- Receive data related to Visitor Screens
- Access, configure, and monitor sensors and their readings

Use this account type for system-level operations where broad and unrestricted access to the platform is necessary.

> 👉 **Note!** Use the `Admin` user only when elevated privileges are required.


### Authentication example

Following example is provided for REACT applications.
You can create AuthResource class to communicate with REST API.

```js
import Axios from "axios";

import RequestError from "./requestError";

export default class AuthResource {
    const API_URL = "https://123456.humly.cloud/api/v1";

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
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
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
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
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
            "some.user@some.email.com",
            "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz"
        ).then((response) => {
            // Store your "userId" and "authToken" to use it for future API calls.
            // The received userId and authToken must be included as headers in all future API requests that require authentication
            // "X-User-Id": {receivedUserId}
            // "X-Auth-Token": {receivedToken}
            
            console.log("LOGIN --> response", response);
        }).catch((error) => {
            console.log("LOGIN --> error", error);
        });
    }

    logout() {
        this.authResource
            .logout(
                "1234abcd5678efgh", //userId is returned upon a successful login
                "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz" //token 
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
## <a name="rooms"></a> Get rooms data - <sub>`{API_URL}/rooms`</sub>

By using these endpoints, you can get information about all rooms, and single room. You can also check for available rooms, get room equipment, and report broken equipment.

### Query Parameters for "all rooms" endpoint

All query parameters are optional.

| Name               | Type    | Comment |
| ------------------ | ------- | ------- |
| `country`          | String  | Name of Country that rooms belong to. |
| `city`             | String  | Name of City that rooms belong to. If provided, then `country` parameter should be provided too.
| `building`         | String  | Name of Building that rooms belongs to. If provided, then `country` and `city` parameters should be provided too.
| `floor`            | String  | Name of Floor that rooms belong to. If provided, then `country`, `city` and `building` parameters should be provided too.
| `startDate`        | String  | Date and time in YYYY-MM-DDThh:mm:ss+00:00 format. Used in combination with status to get resources with specific status in the period.
| `endDate`          | String  | Date and time in YYYY-MM-DDThh:mm:ss+00:00 format.Used in combination with status to get resources with specific status in the period.
| `status`           | String  | Room status. Accepts: available, busy or all. Default is all.
| `minNumberOfSeats` | Number  | Minimum required seats in room.
| `maxNumberOfSeats` | Number  | Maximum required seats in room.
| `roomIdentifier`   | String  | Unique room identifier like _id, id, or email.
| `assignedToMe`     | Boolean | If authenticated user needs to get desks managed by her/him. Accepts: true and false. Default is false.|
| `pageNumber`       | Number  | The page number to return, starting from 1. Default is 1. |
| `pageSize`         | Number  | The number of documents to return per page. The final page may contain fewer results. Default is 10. |
| `sort`             | Object  | A stringified JSON object specifying sorting rules. Format: <br>`{`<br>`  "any.property": "asc/desc",`<br>`  "any.property": "asc/desc"`<br>`}`<br> |

### Querying for a single room

URL to get data about specific room should look like: `{API_URL}/rooms/{uniqueRoomIdentifier}`
where {uniqueRoomIdentifier} can be `_id` property from rooms collection document, or `id` property which represent room unique identifier on the booking system.


### Request example

Following example is provided for REACT applications.
You can create Rooms Resource file to communicate with REST API.

```js
import Axios from "axios";

import RequestError from "./requestError";

export default class RoomsResource {
    const API_URL = "https://123456.humly.cloud/api/v1";

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
                startDate: queryParams.startDate,
                endDate: queryParams.endDate,
                status: queryParams.status,
                minNumberOfSeats: queryParams.minNumberOfSeats,
                maxNumberOfSeats: queryParams.maxNumberOfSeats,
                roomIdentifier: queryParams.roomIdentifier,
                assignedToMe: queryParams.assignedToMe,
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
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
        });
    }

    getRoom(userId, authToken, uniqueRoomIdentifier) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/rooms/${uniqueRoomIdentifier}`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
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
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
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
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
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
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
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
        "bookingSystemSyncSupported": true,
        "resourceType": "room",
        "bookingUri": null,
        "settings": {
          "displaySettings": {
            "organizer": true,
            "subject": true,
            "participants": true
          }
        },
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
        "available": true
      },
      {
        "_id": "1i2j3k4l5m6n7o8p",
        "name": "Room 2",
        "mail": "room2@humly.integration.com",
        "address": "room2@humly.integration.com",
        "id": "room2",
        "numberOfSeats": 0,
        "alias": "Room 2",
        "isActive": true,
        "bookingSystemSyncSupported": true,
        "resourceType": "room",
        "bookingUri": null,
        "settings": {
          "displaySettings": {
            "organizer": true,
            "subject": true,
            "participants": true
          }
        },
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
        "assigned": true,
        "available": true
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
      "bookingSystemSyncSupported": true,
      "resourceType": "room",
      "bookingUri": null,
      "settings": {
        "emailReminder": false,
        "timeZone": "Europe/London",
        "timeZoneCode": "GMT0BST,M3.5.0/1,M10.5.0",
        "allowGuestUsers": true,
        "displaySettings": {
          "organizer": true,
          "subject": true,
          "participants": true
        },
        "bookMeetingSettings": {
          "enabled": true,
          "auth": true
        },
        "bookFutureMeetingSettings": {
          "enabled": true,
          "auth": true
        },
        "endOngoingMeetingSettings": {
          "enabled": true,
          "auth": true,
          "allowOthersToModify": false
        },
        "endFutureMeetingSettings": {
          "enabled": true,
          "auth": true,
          "allowOthersToModify": false
        },
        "extendOngoingMeetingSettings": {
          "enabled": true,
          "auth": true,
          "allowOthersToModify": false
        },
        "extendFutureMeetingSettings": {
          "enabled": true,
          "auth": true,
          "allowOthersToModify": false
        },
        "sleepSettings": {
          "officeHoursStart": "17:00",
          "officeHoursEnd": "08:00",
          "enableWakeUp": true,
          "workingDays": {
            "Monday": true,
            "Tuesday": true,
            "Wednesday": true,
            "Thursday": true,
            "Friday": true,
            "Saturday": false,
            "Sunday": false
          }
        },
        "language": "en",
        "timeFormat": "HH:mm",
        "structureId": "11223344aabbccdd",
        "confirmDuration": "5",
        "confirmMeetingSettings": {
          "enabled": true,
          "auth": true,
          "access": {
            "anyone": true,
            "organizer": false,
            "participants": false
          },
          "touchless": false
        },
        "rotateScreen": false,
        "haloLedSettings": {
          "enabled": true,
          "freeColor": "00B40C",
          "busyColor": "B40500",
          "checkInColor": "A5B40F",
          "signageColor": "000000"
        },
        "reportSettings": {
          "enabled": true,
          "auth": true,
          "email": "",
          "access": {
            "anyone": true,
            "organizer": false,
            "participants": false
          }
        },
        "dateFormat": "LL",
        "networkSetup": "0",
        "displayFindAnotherRoom": {
          "findAnotherRoom": true
        },
        "displayPassiveScreen": true,
        "displayTentativeMeetings": true,
        "analytics": {
          "sendNoShowCostEmail": false,
          "costPerHour": null
        },
        "customFooter": {
          "enabled": false,
          "title": "",
          "text": ""
        },
        "logo": {
          "show": false,
          "id": ""
        },
        "logoLedSettings": {
          "enabled": true,
          "freeColor": "23DC25",
          "busyColor": "C81607",
          "checkInColor": "C8DC14",
          "signageColor": "C8C8C8"
        },
        "signageMode": {
          "fromDate": "",
          "toDate": "",
          "imageMode": false,
          "urlMode": false,
          "logoImageId": "",
          "title": "",
          "subTitle": "",
          "footer": "",
          "image": "",
          "imageName": "",
          "url": ""
        },
        "ntpServer": "0.pool.ntp.org",
        "authentication": {
          "pin": false,
          "rfid": true
        },
        "pinDigits": "4",
        "logLevel": 4,
        "auditData": [
          {
            "createdAt": "2023-08-08T12:00:00+00:00",
            "createdBy": "humly.admin@humly.com",
            "modifiedAt": "2023-08-08T12:00:00+00:00",
            "modifiedBy": "humly.admin@humly.com"
          }
        ]
      },
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
      "available": true
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
| `status`          | String  | Status of API response. Can have values: success or error. |
| `_id`             | String  | Unique room identifier. |
| `name`            | String  | Room name. |
| `mail`            | String  | Email that is related to this room. |
| `address`         | String  | Room address. |
| `id`              | String  | Unique room identified on booking system. |
| `numberOfSeats`   | Number  | Number of seats in room. |
| `alias`           | String  | Room alias. |
| `isActive`        | Boolean | If disabled, room can’t be used. |
| `isDeleted`       | Boolean | Flag showing that room is deleted. |
| `bookingSystemSyncSupported` | Boolean | `true` if resource is connected to resource on the booking system. |
| `resourceType`    | String  | Type of resource.
| `bookingUri`      | String  | Booking system URI if supported. |
| `settings`        | Object  | Object that contains room settings. |
| `lights`          | Boolean | Predefined room equipment. Information about whether the status of the lights can be reported and what the current status is (working or broken). |
| `projector`       | Boolean | Predefined room equipment. Information about whether the status of the projector can be reported and what the current status is (working or broken). |
| `computer`        | Boolean | Predefined room equipment. Information about whether the status of the computer can be reported and what the current status is (working or broken). |
| `teleConference`  | Boolean | Predefined room equipment. Information about whether the status of the teleconference device can be reported and what the current status is (working or broken). |
| `wifi`            | Boolean | Predefined room equipment. Information about whether the status of the WiFi network can be reported and what the current status is (working or broken). |
| `whiteboard`      | Boolean | Predefined room equipment. Information about whether the status of the whiteboard can be reported and what the current status is (working or broken). |
| `videoConference` | Boolean | Information about whether the status of the video conference equipment can be reported and what the current status is (working or broken). |
| `display`         | Boolean | Predefined room equipment. Information about whether the status of the display can be reported and what the current status is (working or broken). |
| `minto`           | Boolean | Predefined room equipment. Information about whether the status of the Minto speakerphone can be reported and what the current status is (working or broken). |
| `ac`              | Boolean | Predefined room equipment. Information about whether the status of the air conditioning device can be reported and what the current status is (working or broken). |
| `information`     | Boolean | Predefined room equipment. Unused. |
| `customEquipment` | Array   | Array of Objects. Represent the name and presence of device present in Room. |
| `structureId`     | String  | Unique structure identifier. |
| `userIds`         | Array   | Array of Strings. Array of user ids assigned to this Room. |
| `assigned`        | Boolean | Is this Room assigned to any Booking device? |
| `available`       | Boolean | `true` if resource is free for booking.

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
| `pageNumber`       | Number  | The page number to return, starting from 1. Default is 1. |
| `pageSize`         | Number  | The number of documents to return per page. The final page may contain fewer results. Default is 10. |
| `sort`             | Object  | A stringified JSON object specifying sorting rules. Format: <br>`{`<br>`  "any.property": "asc/desc",`<br>`  "any.property": "asc/desc"`<br>`}`<br> |
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

## <a name="desks"></a> Get desks data - <sub>`{API_URL}/desks`</sub>

By using these endpoints, you can get information about all desks or single desk.

### Query Parameters for "all desks" endpoint

All query parameters are optional.

| Name               | Type    | Comment |
| ------------------ | ------- | ------- |
| `country`          | String  | Name of Country that desks belong to. |
| `city`             | String  | Name of City that desks belong to. If provided, then `country` parameter should be provided too. |
| `building`         | String  | Name of Building that desks belongs to. If provided, then `country` and `city` parameters should be provided too.
| `floor`            | String  | Name of Floor that desks belong to. If provided, then `country`, `city` and `building` parameters should be provided too.
| `date`             | String  | Date in YYYY-MM-DD format used in combination with status to get free or used desks.
| `status`           | String  | Desks status. Accepts: available, busy or all. Default is all.
| `deskIdentifier`   | String  | Unique desk identifier like _id, id, or email.
| `assignedToMe`     | Boolean | If authenticated user needs to get desks managed by her/him. Accepts: true and false. Default is false.
| `pageNumber`       | Number  | The page number to return, starting from 1. Default is 1. |
| `pageSize`         | Number  | The number of documents to return per page. The final page may contain fewer results. Default is 10. |
| `sort`             | Object  | A stringified JSON object specifying sorting rules. Format: <br>`{`<br>`  "any.property": "asc/desc",`<br>`  "any.property": "asc/desc"`<br>`}`<br> |
### Querying for a single desk

URL to get data about specific desk should look like: `{API_URL}/desks/{uniqueDeskIdentifier}`
where the {uniqueDeskIdentifier} can be `_id` property from rooms collection document, or `id` property which represent desk unique identifier on the booking system, or use desk's email address as an unique identifier.


### Request example

Following example is provided for REACT applications.
You can create Desks Resource file to communicate with REST API.

```js
import Axios from "axios";

import RequestError from "./requestError";

export default class DesksResource {
    const API_URL = "https://123456.humly.cloud/api/v1";

    getAllDesks(userId, authToken, queryParams) {
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
                date: queryParams.date,
                status: queryParams.status,
                deskIdentifier: queryParams.deskIdentifier,
                assignedToMe: queryParams.assignedToMe,
                pageNumber: queryParams.pageNumber,
                pageSize: queryParams.pageSize,
                sort: queryParams.sort,
            },
        };

        return Axios.get(
            `${this.API_URL}/desks`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
        });
    }

    getDesk(userId, authToken, uniqueDeskIdentifier) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/desks/${uniqueDeskIdentifier}`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response                         .data
            );
        });
    }
}

```

### Response example

```json
// Get all desks data
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": [
      {
        "_id": "1a2b3c4d5e6f7g8h",
        "name": "Desk 1",
        "mail": "desk1@humly.integration.com",
        "address": "desk1@humly.integration.com",
        "id": "desk1",
        "numberOfSeats": 0,
        "alias": "Desk 1",
        "isActive": true,
        "bookingSystemSyncSupported": true,
        "bookingUri": null,
        "settings": {
          "displaySettings": {
            "organizer": true
          }
        },
        "resourceType": "desk",
        "structureId": "11223344aabbccdd",
        "userIds": [],
        "assigned": true,
        "available": false
      },
      {
        "_id": "1i2j3k4l5m6n7o8p",
        "name": "Desk 2",
        "mail": "desk2@humly.integration.com",
        "address": "desk2@humly.integration.com",
        "id": "desk2",
        "numberOfSeats": 0,
        "alias": "Desk 2",
        "isActive": true,
        "bookingSystemSyncSupported": true,
        "bookingUri": null,
        "settings": {
          "displaySettings": {
            "organizer": true
          }
        },
        "resourceType": "desk",
        "structureId": "11223344aabbccdd",
        "userIds": [],
        "assigned": true,
        "available": true
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

// Get one desk data
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "_id": "1a2b3c4d5e6f7g8h",
      "name": "Desk 1",
      "mail": "desk1@humly.integration.com",
      "address": "desk1@humly.integration.com",
      "id": "desk1",
      "numberOfSeats": 0,
      "alias": "Desk 1",
      "isActive": true,
      "bookingSystemSyncSupported": true,
      "bookingUri": null,
      "settings": {
        "emailReminder": false,
        "timeZone": "Europe/London",
        "timeZoneCode": "GMT0BST,M3.5.0/1,M10.5.0",
        "allowGuestUsers": false,
        "confirmDuration": "5",
        "displaySettings": {
          "organizer": true
        },
        "bookMeetingSettings": {
          "enabled": true,
          "auth": false
        },
        "bookFutureMeetingSettings": {
          "enabled": false,
          "auth": false
        },
        "endOngoingMeetingSettings": {
          "enabled": true,
          "auth": false,
          "allowOthersToModify": false
        },
        "endFutureMeetingSettings": {
          "enabled": false,
          "auth": false,
          "allowOthersToModify": false
        },
        "extendOngoingMeetingSettings": {
          "enabled": true,
          "auth": false,
          "allowOthersToModify": false
        },
        "extendFutureMeetingSettings": {
          "enabled": false,
          "auth": false,
          "allowOthersToModify": false
        },
        "confirmMeetingSettings": {
          "enabled": false,
          "auth": false,
          "access": {
            "anyone": true,
            "organizer": false,
            "participants": false
          },
          "touchless": false
        },
        "reportSettings": {
          "enabled": true,
          "auth": true,
          "email": "",
          "access": {
            "anyone": true,
            "organizer": false,
            "participants": false
          }
        },
        "sleepSettings": {
          "officeHoursStart": "17:00",
          "officeHoursEnd": "08:00",
          "enableWakeUp": true,
          "workingDays": {
            "Monday": true,
            "Tuesday": true,
            "Wednesday": true,
            "Thursday": true,
            "Friday": true,
            "Saturday": false,
            "Sunday": false
          }
        },
        "language": "en",
        "timeFormat": "hh:mm a",
        "dateFormat": "LL",
        "structureId": "11223344aabbccdd",
        "networkSetup": "0",
        "displayFindAnotherRoom": {
          "findAnotherRoom": true
        },
        "displayPassiveScreen": true,
        "displayTentativeMeetings": true,
        "analytics": {
          "sendNoShowCostEmail": false,
          "costPerHour": null
        },
        "customFooter": {
          "enabled": false,
          "title": "",
          "text": ""
        },
        "logo": {
          "show": false,
          "id": ""
        },
        "haloLedSettings": {
          "enabled": true,
          "freeColor": "00B40C",
          "busyColor": "B40500",
          "checkInColor": "A5B40F",
          "signageColor": "000000"
        },
        "logoLedSettings": {
          "enabled": true,
          "freeColor": "23DC25",
          "busyColor": "C81607",
          "checkInColor": "C8DC14",
          "signageColor": "C8C8C8"
        },
        "signageMode": {
          "fromDate": "",
          "toDate": "",
          "imageMode": false,
          "urlMode": false,
          "logoImageId": "",
          "title": "",
          "subTitle": "",
          "footer": "",
          "image": "",
          "imageName": "",
          "url": ""
        },
        "rotateScreen": false,
        "ntpServer": "0.pool.ntp.org",
        "authentication": {
          "pin": false,
          "rfid": true
        },
        "pinDigits": "4",
        "logLevel": 4,
        "auditData": [
          {
            "createdAt": "2023-08-08T12:00:00+00:00",
            "createdBy": "humly.admin@humly.com",
            "modifiedAt": "2023-08-08T12:00:00+00:00",
            "modifiedBy": "humly.admin@humly.com"
          }
        ]
      },
      "resourceType": "desk",
      "structureId": "11223344aabbccdd",
      "userIds": [],
      "assigned": true
    }
  }
}
```

### Type of response data

| Name                         | Type    | Comment |
| ---------------------------- | ------- | ------- |
| `responseStatus`             | Number  | Status of HTTP/HTTPS request. |
| `status`                     | String  | Status of API response. Can have values: success or error. |
| `_id`                        | String  | Unique Desk identifier. |
| `name`                       | String  | Desk name. |
| `mail`                       | String  | Email that is related to this desk. |
| `address`                    | String  | Desk address. |
| `id`                         | String  | Unique desk identified on the booking system. |
| `numberOfSeats`              | Number  | Number of seats. |
| `alias`                      | String  | Desk alias. |
| `isActive`                   | Boolean | If disabled, desk can’t be used. |
| `bookingSystemSyncSupported` | Boolean | `true` if resource is connected to resource on the booking system. |
| `resourceType`               | String  | Type of resource.
| `bookingUri`                 | String  | Booking system URI if supported. |
| `settings`                   | Object  | Object that contains desk settings. |
| `structureId`                | String  | Unique structure identifier. |
| `userIds`                    | Array   | Array of Strings. Array of user ids assigned to this desk. |
| `assigned`                   | Boolean | Is this desk assigned to any Booking device? |

## <a name="bookings"></a> Working with “bookings” API - <sub>`{API_URL}/bookings`</sub>

By using these endpoints, you can get information about your bookings. You can create, update, or delete booking

### Request example

Following example is provided for REACT applications.
You can create Bookings Resource file to communicate with REST API.

```js
import Axios from "axios";

import RequestError from "./requestError";

export default class BookingsResource {
    const API_URL = "https://123456.humly.cloud/api/v1";

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
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
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
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
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
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
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
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
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
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
        });
    }
}

```

## <a name="getMeetings"></a> Get organizer meetings – <sub>`GET {API_URL}/bookings`</sub>

This endpoint is used to get meetings organized by given user.

### Query Parameters

| Name            | Type   | Mandatory | Comment |
| --------------- | ------ | --------- | ------- |
| `organizerUser` | String | Yes       | Unique identifier of the user. `userId` string returned by login. Users can see only their own bookings. |
| `startDate`     | String | No        | Limits returned meetings data to include meetings that have start date greater or equal to provided date. If this parameter is not provided this endpoint will return all bookings for this user from start of the ongoing day. Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). |
| `endDate`       | String | No        | Limits returned meetings data to include meetings that have end date lower than provided date. If this parameter is not provided this endpoint will return all bookings for this user until end of the ongoing day. Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). |
| `pageNumber`       | Number  | The page number to return, starting from 1. Default is 1. |
| `pageSize`         | Number  | The number of documents to return per page. The final page may contain fewer results. Default is 10. |
| `sort`             | Object  | A stringified JSON object specifying sorting rules. Format: <br>`{`<br>`  "any.property": "asc/desc",`<br>`  "any.property": "asc/desc"`<br>`}`<br> |

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

> 👉 **Important note!** If the authenticated user is not a global admin, or booking owner, only a subset of booking data will be returned by the API.


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
        "source": "HCP",
        "eventIdentifier": "ABCDEFGHIJKL1234567890AB_ABCDEFGHIJKL1234567890AB",
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
            "mail": "HumlyIntegrationUser",
            "createdAt": "2019-09-01T11:55:05+00:00",
            "userId": "11223344aabbccdd",
            "isGuestUser": false
          },
          "sensitivity": "Normal",
          "isAllDayEvent": false,
          "endType": null,
          "confirmed": false,
          "subject": "Humly meeting",
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
          "fetchedOrganizer": null,
          "fetchedParticipants": false,
          "participants": [],
          "attendees": []
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
| `status`            | String  | Status of API response. Can have values: success or error. |
| `_id`               | String  | Unique booking identifier. |
| `id`                | String  | Booking system unique identifier. |
| `changeKey`         | String  | Booking system change key value. |
| `source`            | String  | Specifies where the booking is created. |
| `eventIdentifier`   | String  | Additional unique booking identifier on the booking system if supported.
| `startDate`         | String  | UTC meeting start date in ISO date format. |
| `endDate`           | String  | UTC meeting end date in ISO date format. |
| `location`          | String  | Room name on the booking system. |
| `startTime`         | String  | Meeting start time in 24 hours format (HH24:MI). |
| `endTime`           | String  | Meeting end time in 24 hours format (HH24:MI). |
| `onlyDate`          | String  | Date of meeting in YYYY-MM-DD format. |
| `dateForStatistics` | String  | Date used for statistics processing. |
| `name`              | String  | Name of user that booked a meeting. |
| `mail`              | String  | Email of user that booked a meeting if available, otherwise same as name. |
| `createdAt`         | String  | Date and time of booking creation.
| `userId`            | String  | Unique identifier of booking creator if registered in system. |
| `isGuestUser`       | Boolean | `true` if booking creator is a Guest user. |
| `endType`           | String  | Description of meeting end event. |
| `confirmed`         | Boolean | `true` if meeting is checked in. |
| `subject`           | String  | Meeting subject. |
| `sensitivity`       | String  | Booking sensitivity.
| `freeBusyStatus`    | String  | Booking system specific value. |
| `showConfirm`       | Boolean | `true` if check in functionality is enabled. |
| `sendReminderEmailCheck` | Boolean | `true` if Send email remainder functionality is enabled. |
| `sendReminderEmailCheckTime` | Number  | Used to calculate a time when to send check in remainder email. Provided in number of minutes before meeting start. |
| `sendCancellationEmailCheck` | Boolean | `true` if email should be send to meeting organizer after meeting is automatically deleted after checking period. |
| `reminderEmailSent` | Boolean | `true` if remainder email has been sent to organizer 5 minutes before meeting start. |
| `cancellationEmailSent` | Boolean | `true` if cancellation email has been sent to organizer after meeting is automatically deleted after check in period. |
| `fetchedOrganizer`  | String  | Organizer fetched from booking system. |
| `participants`      | Array   | Array of meeting participants. |
| `attendees`         | Array   | Array of meeting attendees. |

## <a name="createMeeting"></a> Create a meeting – <sub>`POST {API_URL}/bookings`</sub>

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
      "source": "HCP",
      "eventIdentifier": "ABCDEFGHIJKL1234567890AB_ABCDEFGHIJKL1234567890AB",
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
          "mail": "HumlyIntegrationUser",
          "createdAt": "2019-09-01T11:55:05+00:00",
          "userId": "11223344aabbccdd",
          "isGuestUser": false
        },
        "sensitivity": "Normal",
        "endType": null,
        "confirmed": false,
        "subject": "Humly meeting",
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
        "fetchedOrganizer": null,
        "fetchedParticipants": false,
        "participants": [],
        "attendees": []
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

## <a name="updateMeeting"></a> Update a meeting - <sub>`PATCH {API_URL}/bookings/:bookingId`</sub>

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

## <a name="deleteMeeting"></a> Delete a meeting - <sub>`DELETE {API_URL}/bookings/:bookingId`</sub>

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

## <a name="checkInMeeting"></a> Check-in a meeting - `PUT {API_URL}/bookings/checkedIn?bookingId=:bookingId`

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
                console.log("CHECK IN BOOKING --> response", response);
            })
            .catch((error) => {
                console.log("CHECK IN BOOKING --> error", error);
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

## <a name="structures"></a> Get structures data – <sub>`GET {API_URL}/structures`</sub>

This endpoint returns hierarchical structure data (Country, City, Building, Floor) for the authenticated user.

### Query Parameters

| Name           | Type   | Mandatory | Comment                                                                             |
| -------------- | ------ | --------- | ----------------------------------------------------------------------------------- |
| `pageNumber`   | Number | No        | The page number to return, starting from 1. Default is 1.                           |
| `pageSize`     | Number | No        | The number of documents to return per page. Default is 10.                          |
| `sort`         | Object | No        | A stringified JSON object specifying sorting rules.<br>Format:<br>`{"name": "asc"}` |
| `structureIds` | String | No        | Comma-separated list of structure IDs.<br>Example: `structureIds=122,1332,2434`     |

### Headers

| Name           | Type   | Mandatory | Comment                                      |
| -------------- | ------ | --------- | -------------------------------------------- |
| `X-User-Id`    | String | Yes       | Unique identifier of the authenticated user. |
| `X-Auth-Token` | String | Yes       | Valid authentication token.                  |

---

### Request example

You can create a `StructuresResource` file to communicate with the REST API. (React example below)

```js
import Axios from "axios";
import RequestError from "./requestError";

export default class StructuresResource {
    const API_URL = "https://123456.humly.cloud/api/v1";

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
                structureIds: queryParams.structureIds // Optional filter
            },
        };

        return Axios.get(
            `${this.API_URL}/structures`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
        });
    }
}
```
---

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
---

### Type of response data

| Name             | Type           | Comment                                                            |
| ---------------- | -------------- | ------------------------------------------------------------------ |
| `responseStatus` | Number         | Status of HTTP request                                             |
| `status`         | String         | API response status: `success` or `error`                          |
| `_id`            | String         | Unique identifier for structure node                               |
| `name`           | String         | Name of Country, City, Building, or Floor                          |
| `level`          | Number         | Hierarchical level: 1 = Country, 2 = City, 3 = Building, 4 = Floor |
| `parent`         | String\|Number | ID of parent node (if applicable)                                  |
| `cities`         | Array          | List of city objects under Country                                 |
| `buildings`      | Array          | List of building objects under City                                |
| `floors`         | Array          | List of floor objects under Building                               |
| `roomIds`        | Array          | Room IDs assigned to the floor                                     |

> ℹ️ A node can contain child arrays (`cities`, `buildings`, `floors`) depending on its level.

Let me know if you'd like this endpoint added to an OpenAPI/Swagger file.


## <a name="devices"></a> Get devices data - `{API_URL}/devices`

### Request example

You can create Devices Resource file to communicate with REST API (REACT example). Devices can be queried by status to get Online, Offline, Sleeping, or Unassigned devices. If parameter is not provided, endpoint will return all devices.

Single device can be queried by unique identifier _id, ethernet MAC
address, or wifi MAC address.

```js
import Axios from "axios";

import RequestError from "./requestError";

export default class DevicesResource {
    const API_URL = "https://123456.humly.cloud/api/v1";

    getAllDevices(userId, authToken, queryParams) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {
                status: queryParams.status,
                pageNumber: queryParams.pageNumber,
                pageSize: queryParams.pageSize,
                sort: queryParams.sort,
            },
        };

        return Axios.get(
            `${this.API_URL}/devices`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
        });
    }

    getDevice(userId, authToken, deviceUniqueIdentifier) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/devices/${deviceUniqueIdentifier}`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
        });
    }
}

```

### Response example

```json
// Get all devices data
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": [
      {
        "_id": "12345678ab",
        "resourceId": "a1b2c3d4e5f6",
        "macAddress": "11:22:33:44:55:66",
        "isRebootable": false,
        "wentOfflineAt": "2021-12-01T17:00:00+00:00",
        "lastRebootTime": "2021-12-01T06:56:00+00:00",
        "lastConnectionTime": "2021-12-01T06:58:27+00:00",
        "macAddressWifi": "aa:bb:cc:dd:ee:ff",
        "ipAddress": "127.0.0.1",
        "secondIpAddress": "Not available",
        "interfaceActive": "ethernet",
        "serverIpAddress": "192.168.100.100",
        "firmwareVersion": "2021-11-01_v1.7.2.15",
        "vncActive": false,
        "serialId": "ABC123456",
        "isPairingKeyApproved": true,
        "deviceType": "hrd1",
        "sleepFrom": "2021-12-01T17:00:00+00:00",
        "wakeAt": "2021-12-02T06:55:00+00:00",
        "status": "Online",
        "upgradeStatus": null,
        "vncConnectionUrl": ""
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
        "property": "macAddress",
        "direction": "ASC"
      }
    ]
  }
}

// Get device data
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "_id": "12345678ab",
      "resourceId": "a1b2c3d4e5f6",
      "macAddress": "11:22:33:44:55:66",
      "isRebootable": false,
      "wentOfflineAt": "2021-12-01T17:00:00+00:00",
      "lastRebootTime": "2021-12-01T06:56:00+00:00",
      "lastConnectionTime": "2021-12-01T06:58:27+00:00",
      "macAddressWifi": "aa:bb:cc:dd:ee:ff",
      "ipAddress": "127.0.0.1",
      "secondIpAddress": "Not available",
      "interfaceActive": "ethernet",
      "serverIpAddress": "192.168.100.100",
      "firmwareVersion": "2021-11-01_v1.7.2.15",
      "vncActive": false,
      "serialId": "ABC123456",
      "isPairingKeyApproved": true,
      "deviceType": "hrd1",
      "sleepFrom": "2021-12-01T17:00:00+00:00",
      "wakeAt": "2021-12-02T06:55:00+00:00",
      "status": "Sleeping",
      "upgradeStatus": null,
      "vncConnectionUrl": ""
    }
  }
```
### Type of response data

| Name                   | Type    | Comment |
| ---------------------- | ------- | ------- |
| `responseStatus`       | Number  | Status of HTTP/HTTPS request. |
| `status`               | String  | Status of API response. Can have values: success or error. |
| `_id`                  | String  | Device document unique identifier. |
| `resourceId`           | String  | Unique resource identifier device is attached to. |
| `macAddress`           | String  | Device ethernet interface MAC address. |
| `isRebootable`         | Boolean | true if the device is rebootable for the moment. |
| `wentOfflineAt`        | String  | Date and time when the device went offline last time. |
| `lastRebootTime`       | String  | Date and time of device last reboot. |
| `lastConnectionTime`   | String  | Date and time of device last connection. |
| `macAddressWifi`       | String  | Device wifi interface MAC address. |
| `secondIpAddress`      | String  | IP address assigned to wifi interface if available. |
| `ipAddress`            | String  | IP address assigned to ethernet interface. |
| `interfaceActive`      | String  | Name of the interface used to connect device to network. Can have values: ethernet of wifi. |
| `serverIpAddress`      | String  | Address of server device is connected to. |
| `firmwareVersion`      | String  | Version of device firmware. |
| `vncActive`            | Boolean | true if VNC service is activated on the device. |
| `serialId`             | String  | Device serial number. |
| `isPairingKeyApproved` | Boolean | true if device is authenticated using paring key. |
| `deviceType`           | String  | Device type attached to a resource like HRM or HBD. |
| `sleepFrom`            | String  | Date and time when device should enter Sleeping status. |
| `wakeAt`               | String  | Date and time when device should wake next time. |
| `status`               | String  | Status of the device. Can be one of: Online, Offline, Sleeping or Unassigned. |
| `upgradeStatus`        | String  | Value representing current status of device upgrade process. |
| `vncConnectionUrl`     | String  | URL to be used to connect to device remotely. |

## <a name="sensors"></a> Working with sensors - `{API_URL}/sensors`

The `/sensors` route provides a collection of endpoints for managing sensor data. You can perform the following operations:

- Retrieve sensor data using various query options
- Create, update, and delete sensors

> 👉 **Note!** Adding sensors is optional. You can directly use the [`PUT {API_URL}/sensor-readings`](#addSensorReading) endpoint to create a new sensor and add a reading in a single request.

### Retrieve sensor data

You can retrieve sensor information by performing one of the following actions:
- Fetch data for multiple sensors: [`GET {API_URL}/sensors`](#getAllSensors)
- Fetch data for a specific sensor by ID: [`GET {API_URL}/sensors/:id`](#getOneSensors)

### <a name="getAllSensors"></a> Fetch data for multiple sensors `GET {API_URL}/sensors`

This endpoint returns paginated data for multiple sensors. It supports filtering by `name`, `type`, `sensorId`, and `externalId`. When multiple filters are provided, only sensors that match all specified criteria will be included in the results. You can control pagination using the `pageNumber` and `pageSize` query parameters.

To limit the response to specific fields, provide a comma-separated list of desired field names. Sorting can be applied by passing a stringified sort object as a query parameter.

#### Query Parameters

All query parameters are optional.

| Name               | Type    | Comment |
| ------------------ | ------- | ------- |
| `name`             | String  | Filters sensors by an exact match of the sensor name. This parameter is case-sensitive. |
| `type`             | String  | Filters sensors by type. Supported values: `temperature`, `relativeHumidity`, `pressure`, `co2`, `motion`, `occupancy`, `presence`, `water`. |
| `sensorId`         | String  | Filters by the unique sensor identifier (`_id`) returned by this endpoint. |
| `externalId`       | String  | Filters sensors by an exact match of the external ID provided by you. This parameter is case-sensitive. |
| `pageNumber`       | Number  | The page number to return, starting from 1. Default is 1. |
| `pageSize`         | Number  | The number of documents to return per page. The final page may contain fewer results. Default is 10. |
| `fields`           | String  | A comma-separated list of fields to include in the response. Allowed values: `_id`, `type`, `externalId`, `name`, `description`, `resourceIds`, `status`, `distributor`, `minRange`, `maxRange`, `displayUnitCode`, `displayUnit` |
| `sort`             | Object  | A stringified JSON object specifying sorting rules. Format: <br>`{`<br>`  "any.property": "asc/desc",`<br>`  "any.property": "asc/desc"`<br>`}`<br> |

### Response example

```json
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": [
        {
            "_id": "a12345678b",
            "type": "co2",
            "externalId": "abcd1234efgh",
            "status": "Online",
            "distributor": "Sensor manufacturer",
            "name": "Co2 Sensor for Room 1",
            "minRange": 1000,
            "maxRange": 2000,
            "displayUnitCode": "ppm",
            "displayUnit": "Molecules per million",
            "resourceIds": ["a1b2c3d4e5f6"]
        },
    ],
    "page": {
        "first": true,
        "last": true,
        "size": 10,
        "elements": "1 - 1",
        "totalElements": 1,
        "totalPages": 1,
        "number": 1,
        "numberOfElements": 1
    },
    "sort": [
        {
            "property": "type",
            "direction": "ASC"
        },
        {
            "property": "externalId",
            "direction": "ASC"
        }
    ]
  }
}
```
### Type of response data

| Name               | Type    | Comment |
| ------------------ | ------- | ------- |
| `responseStatus`   | Number  | Status of HTTP/HTTPS request. |
| `status`           | String  | Status of API response. Can have values: success or error. |
| `_id`              | String  | Sensor document unique identifier. |
| `type`             | String  | Sensor type. `temperature`, `relativeHumidity`, `pressure`, `co2`, `motion`, `occupancy`, `presence`, or `water` |
| `externalId`       | String  | Sensor external identifier. |
| `status`           | String  | Sensor status. `Online`, `Offline`, or `Unavailable`. |
| `name`             | String  | Sensor name. |
| `description`      | String  | Sensor description. |
| `distributor`      | String  | Sensor manufacturer name. |
| `minRange`         | Number  | Minimum sensor reading range considered as normal. In case of a CO2 sensor this value is upper limit for the normal concentration. |
| `maxRange`         | Number  | Maximum sensor reading range considered as normal. In case of a CO2 sensor this value is upper value for moderate concentration level. Concentration above this level is treated as critical. |
| `displayUnitCode`  | String  | Unit code (eg. °C) to be used when showing readings. |
| `displayUnit`      | String  | Unit (eg. Celsius) to be used when showing readings. |
| `resourceIds`      | Array   | Array of unique resource identifiers (`_id`) that sensor is attached to. |

### <a name="getOneSensors"></a> Fetch data for a specific sensor by ID `GET {API_URL}/sensors/:id`

Returns data for a specific sensor matching ID. 

### Response example

```json
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
        "_id": "a12345678b",
        "type": "co2",
        "externalId": "abcd1234efgh",
        "status": "Online",
        "distributor": "Sensor manufacturer",
        "name": "Co2 Sensor 1",
        "description": "Co2 Sensor for Room 1",
        "minRange": 1000,
        "maxRange": 2000,
        "displayUnitCode": "ppm",
        "displayUnit": "Molecules per million",
        "resourceIds": ["a1b2c3d4e5f6"]
    }
  }
}
```

### Create, update, and delete sensors

Supported actions:
- Create new sensor: [`POST {API_URL}/sensors`](#createNewSensor)
- Update sensor data: [`PATCH {API_URL}/sensors/:id`](#patchSensor)
- Delete sensor: [`DELETE {API_URL}/sensors/:id`](#deleteSensor)

### <a name="createNewSensor"></a> Create new sensor `POST {API_URL}/sensors`

This endpoint is used to add a new sensor.

### Parameters

| Name               | Type    | Mandatory | Comment |
| ------------------ | ------- | --------- | ------- |
| `type`             | String  | Yes       | Sensor type. `temperature`, `relativeHumidity`, `pressure`, `co2`, `motion`, `occupancy`, `presence`, or `water` |
| `externalId`       | String  | Yes       | Sensor external identifier. |
| `status`           | String  | No        | Sensor status. `Online`, `Offline`, or `Unavailable`. |
| `name`             | String  | No        | Sensor name. |
| `description`      | String  | No        | Sensor description. |
| `distributor`      | String  | No        | Sensor manufacturer name. |
| `minRange`         | Number  | No        | Minimum sensor reading range considered as normal. In case of a CO2 sensor this value is upper limit for the normal concentration. |
| `maxRange`         | Number  | No        | Maximum sensor reading range considered as normal. In case of a CO2 sensor this value is upper value for moderate concentration level. Concentration above this level is treated as critical. |
| `displayUnitCode`  | String  | No        |  Unit code (eg. °C) to be used when showing readings. |
| `displayUnit`      | String  | No        | Unit (eg. Celsius) to be used when showing readings. |
| `resourceIds`      | Array   | No        | Array of unique resource identifiers (`_id`) that sensor is attached to. |

### Request example

```js
    createSensor() {
        const sensorData = {
            type: "temperature",
            externalId: "temperature1",
            status: "Online",
            distributor: "Humly sensor integration",
            name: "Temperature 1",
            minRange: 20,
            maxRange: 24,
            resourceIds: "a1b2c3d4e5f6,123456abcdef",
        };
        this.sensorResource.createSensor(
            "1234abcd5678efgh",
            "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz",
            sensorData
        ).then((response) => {
            console.log("CREATE SENSOR --> response", response);
        }).catch((error) => {
            console.log("CREATE SENSOR --> error", error);
        });
    }

```

### Response example

``` json
{
  "responseStatus": 201,
  "responseData": {
    "status": "success",
    "data": {
        "_id": "11aa22bb33cc44dd55ee",
        "type": "temperature",
        "externalId": "temperature1",
        "status": "Online",
        "distributor": "Humly sensor integration",
        "name": "Temperature 1",
        "displayUnitCode": "°C",
        "displayUnit": "Celsius",
        "minRange": 20,
        "maxRange": 24,
        "resourceIds": [
            "a1b2c3d4e5f6",
            "123456abcdef"
        ]
    }
  }
}
```

### Error response example

```json
// Required field is not provided
{
  "responseStatus": 500,
  "responseData": {
    "status": "error",
    "message": "External ID is required"
  }
}
```

### <a name="patchSensor"></a> Update sensor data `PATCH {API_URL}/sensors/:id`

The `:id` parameter represents the unique identifier (`_id`) of the sensor. This endpoint allows you to update any of the sensor's properties. Properties not included in the request body will remain unchanged in the database. The properties available for update are the same as those described in the [Create sensor section](#createNewSensor) section. The expected response format is also identical to that of the creation endpoint.

### <a name="deleteSensor"></a> Delete sensor `DELETE {API_URL}/sensors/:id`

To delete a sensor from the database, send a `DELETE` request to `{API_URL}/sensors/:id`, where `:id` is the unique identifier (`_id`) of the sensor.

## <a name="sensorReadings"></a> Managing sensor readings - `{API_URL}/sensor-readings`

The `/sensor-readings` route provides a collection of endpoints for managing sensor readings data. You can perform the following operations:

- Retrieve sensor reading data using various query options
- Add, and delete sensor readings

Sensor readings are grouped by sensor on a daily basis, using the UTC time zone. Each sensor reading object contains all relevant sensor information along with an array of individual `readings`. Each entry in the readings array includes the sensor reading value, an event ID, and the timestamp of the reading. The timestamp is always generated by the sensor. If an event ID is not provided, it will be automatically generated.

### Retrieve sensor reading data

You can retrieve sensor reading information by performing one of the following actions:
- Fetch multiple sensor readings: [`GET {API_URL}/sensor-readings`](#getAllSensorReadings)
- Fetch a specific sensor reading by ID: [`GET {API_URL}/sensors-readings/:id`](#getOneSensorReading)

### <a name="getAllSensorReadings"></a> Fetch multiple sensor readings `GET {API_URL}/sensor-readings`

This endpoint returns paginated data for multiple sensor readings. It supports filtering by `date`, `type`, `sensorId`, `externalId`, and `status`. When multiple filters are provided, only sensor readings that match all specified criteria will be included in the results. You can control pagination using the `pageNumber` and `pageSize` query parameters.

To limit the response to specific fields, provide a comma-separated list of desired field names. Sorting can be applied by passing a stringified `sort` object as a query parameter.

#### Query Parameters

All query parameters are optional.

| Name               | Type    | Comment |
| ------------------ | ------- | ------- |
| `date`             | String  | Filters sensor readings grouped by `date` in the UTC time zone. |
| `type`             | String  | Filters sensor readings by type. Supported values: `temperature`, `relativeHumidity`, `pressure`, `co2`, `motion`, `occupancy`, `presence`, `water`. |
| `sensorId`         | String  | Filters by the unique sensor identifier (`_id`). |
| `externalId`       | String  | Filters sensors by an exact match of the external ID provided by you. This parameter is case-sensitive. |
| `status`           | String  | Sensor status. `Online`, `Offline`, or `Unavailable`. |
| `pageNumber`       | Number  | The page number to return, starting from 1. Default is 1. |
| `pageSize`         | Number  | The number of documents to return per page. The final page may contain fewer results. Default is 10. |
| `fields`           | String  | A comma-separated list of fields to include in the response. Allowed values: `_id`, `date`, `type`, `sensorId`, `externalId`, `resourceIds`, `status`, `minRange`, `maxRange`, `displayUnitCode`, `displayUnit`, `unitCode`, `unit`, `readings` |
| `sort`             | Object  | A stringified JSON object specifying sorting rules. Format: <br>`{`<br>`  "any.property": "asc/desc",`<br>`  "any.property": "asc/desc"`<br>`}`<br> |

### Response example

```json
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": [
        {
            "_id": "12345abcde12",
            "sensorId": "a12345678b",
            "externalId": "abcd1234efgh",
            "date": "2025-04-23T00:00:00+00:00",
            "type": "co2",
            "displayUnit": "Molecules per million",
            "displayUnitCode": "ppm",
            "maxRange": 2000,
            "minRange": 1000,
            "readings": [
                {
                    "eventId": "Hp1tWguPUmc4echN",
                    "value": 442,
                    "updateTime": "2025-04-23T16:11:35+00:00"
                }
            ],
            "resourceIds": [
                "a1b2c3d4e5f6"
            ],
            "status": "Online"
        }
    ],
    "page": {
        "first": true,
        "last": true,
        "size": 10,
        "elements": "1 - 1",
        "totalElements": 1,
        "totalPages": 1,
        "number": 1,
        "numberOfElements": 1
    },
    "sort": [
        {
            "property": "date",
            "direction": "ASC"
        },
        {
            "property": "type",
            "direction": "ASC"
        },
        {
            "property": "externalId",
            "direction": "ASC"
        }
    ]
  }
}
```

### Type of response data

| Name               | Type    | Comment |
| ------------------ | ------- | ------- |
| `responseStatus`   | Number  | Status of HTTP/HTTPS request. |
| `status`           | String  | Status of API response. Can have values: success or error. |
| `_id`              | String  | Sensor reading document unique identifier. |
| `type`             | String  | Sensor type. `temperature`, `relativeHumidity`, `pressure`, `co2`, `motion`, `occupancy`, `presence`, or `water` |
| `date`             | String  | Readings group date in UTC time zone. |
| `sensorId`         | String  | Sensor unique identifier. Refers to `_id` returned by the `/sensors` endpoint. |
| `externalId`       | String  | Sensor external identifier. |
| `status`           | String  | Sensor status. `Online`, `Offline`, or `Unavailable`. |
| `minRange`         | Number  | Minimum sensor reading range considered as normal. In case of a CO2 sensor this value is upper limit for the normal concentration. |
| `maxRange`         | Number  | Maximum sensor reading range considered as normal. In case of a CO2 sensor this value is upper value for moderate concentration level. Concentration above this level is treated as critical. |
| `displayUnitCode`  | String  | Unit code (eg. °C) to be used when showing readings. |
| `displayUnit`      | String  | Unit (eg. Celsius) to be used when showing readings. |
| `resourceIds`      | Array   | Array of unique resource identifiers (`_id`) that sensor is attached to. |
| `readings`         | Array   | An array of reading documents, where each reading includes an `eventId`, `value`, and `updateTime`. Readings are grouped by date in the UTC time zone. |

### <a name="getOneSensorReading"></a> Fetch a specific sensor reading by ID `GET {API_URL}/sensors-readings/:id`

Returns data for a specific sensor reading matching ID. 

### Response example

```json
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": {
      "_id": "12345abcde12",
      "sensorId": "a12345678b",
      "externalId": "abcd1234efgh",
      "date": "2025-04-23T00:00:00+00:00",
      "type": "co2",
      "displayUnit": "Molecules per million",
      "displayUnitCode": "ppm",
      "maxRange": 2000,
      "minRange": 1000,
      "readings": [
          {
              "eventId": "Hp1tWguPUmc4echN",
              "value": 442,
              "updateTime": "2025-04-23T16:11:35+00:00"
          }
      ],
      "resourceIds": [
          "a1b2c3d4e5f6"
      ],
      "status": "Online"
    }
  }
}
```
### Add, and delete sensor readings

Supported actions:
- Add new sensor reading: [`PUT {API_URL}/sensors-readings`](#addSensorReading)
- Delete sensor reading: [`DELETE {API_URL}/sensor-readings/:id`](#deleteSensorReading)

### <a name="addSensorReading"></a> Add new sensor reading `PUT {API_URL}/sensors-readings`

This endpoint is used to add a new sensor reading. If no reading exists for the current day (based on the UTC time zone), a new document will be created. Otherwise, the reading will be appended to the existing readings array for that day.
If the sensor does not already exist, this endpoint will automatically create it. In that case, you must provide the basic sensor information: `type`, `externalId`, `name`, `status`, and the list of resources the sensor is associated with (`resourceIds`).
If the sensor already exists in the database, you only need to provide the `sensorId` and a reading `value` to add a new reading.

### Parameters

| Name               | Type    | Mandatory | Comment |
| ------------------ | ------- | --------- | ------- |
| `value`            | Number, Boolean, or String | Yes | Sensor reading value. |
| `sensorId`         | String  | Conditional | Sensor unique identifier. Refers to `_id` returned by the `/sensors` endpoint. If provided `externalId` and `type` are not needed. |
| `type`             | String  | Conditional | Sensor type. `temperature`, `relativeHumidity`, `pressure`, `co2`, `motion`, `occupancy`, `presence`, or `water`. Must be provided if `sensorId` is omitted. |
| `externalId`       | String  | Conditional | Sensor external identifier. Must to be provided if `sensorId` is omitted. |
| `status`           | String  | No        | Sensor status. `Online`, `Offline`, or `Unavailable`. |
| `name`             | String  | No        | Sensor name. |
| `distributor`      | String  | No        | Sensor manufacturer name. |
| `minRange`         | Number  | No        | Minimum sensor reading range considered as normal. In case of a CO2 sensor this value is upper limit for the normal concentration. |
| `maxRange`         | Number  | No        | Maximum sensor reading range considered as normal. In case of a CO2 sensor this value is upper value for moderate concentration level. Concentration above this level is treated as critical. |
| `displayUnitCode`  | String  | No        | Unit code (eg. °C) to be used when showing readings. |
| `displayUnit`      | String  | No        | Unit (eg. Celsius) to be used when showing readings. |
| `unitCode`         | String  | No        | Unit code (eg. °F) used by sensor. |
| `unit`             | String  | No        | Measurement unit (eg. Fahrenheit) used by the sensor. |
| `resourceIds`      | Array   | No        | Array of unique resource identifiers (`_id`) that sensor is attached to. |

### Request example

```js
    addSensorReading() {
        const sensorReadingData = {
            type: "temperature",
            externalId: "temperature1",
            status: "Online",
            distributor: "Humly sensor integration",
            name: "Temperature 1",
            minRange: 20,
            maxRange: 24,
            resourceIds: "a1b2c3d4e5f6,123456abcdef",
            value: 21.7
        };
        this.sensorResource.addSensorReading(
            "1234abcd5678efgh",
            "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz",
            sensorReadingData
        ).then((response) => {
            console.log("ADD SENSOR READING--> response", response);
        }).catch((error) => {
            console.log("ADD SENSOR READING--> error", error);
        });
    }

    // If the sensor already exists
    addSensorReading() {
        const sensorReadingData = {
            sensorId: "a12345678b",
            value: 21.7
        };
        this.sensorResource.addSensorReading(
            "1234abcd5678efgh",
            "abcdefghijklmnoprstuvzabcdefghijklmnoprstuvz",
            sensorReadingData
        ).then((response) => {
            console.log("ADD SENSOR READING--> response", response);
        }).catch((error) => {
            console.log("ADD SENSOR READING--> error", error);
        });
    }

```

### Response example

``` json
{
  "responseStatus": 201,
  "responseData": {
    "status": "success",
    "data": {
        "_id": "1a9f2b8e3c7d",
        "sensorId": "a12345678b",
        "externalId": "co2_sensor_1",
        "date": "2025-04-23T00:00:00+00:00",
        "type": "co2",
        "displayUnit": "Molecules per million",
        "displayUnitCode": "ppm",
        "maxRange": 2000,
        "minRange": 1000,
        "readings": [
            {
                "eventId": "nLqBDihy7CAg5Rd8",
                "value": 519,
                "updateTime": "2025-04-23T20:25:09+00:00"
            },
            {
                "eventId": "Hp1tWguPUmc4echN",
                "value": 442,
                "updateTime": "2025-04-23T16:11:35+00:00"
            }
        ],
        "resourceIds": [
            "a1b2c3d4e5f6"
        ],
        "status": "Online"
    }
  }
}
```

### Error response example

```json
// Required fields are not provided
{
  "responseStatus": 500,
  "responseData": {
    "status": "error",
    "message": "You must provide externalId or sensorId"
  }
}
```

### <a name="deleteSensorReading"></a> Delete sensor reading `DELETE {API_URL}/sensor-readings/:id`

To delete a sensor reading from the database, send a `DELETE` request to `{API_URL}/sensor-readings/:id`, where `:id` is the unique identifier (`_id`) of the sensor reading.


## <a name="getVisitorScreens"></a> Get visitor screens – <sub>`GET {API_URL}/visitor-screens`</sub>

This endpoint is used to fetch a paginated list of visitor screens configured for the authenticated user.

### Query Parameters

| Name         | Type   | Mandatory | Comment                                                                                                     |
| ------------ | ------ | --------- | ----------------------------------------------------------------------------------------------------------- |
| `pageNumber` | Number | No        | Page number to retrieve. Starts from 1. Default is 1.                                                       |
| `pageSize`   | Number | No        | Number of results per page. Default is 10.                                                                  |
| `sort`       | Object | No        | A stringified JSON object specifying sorting rules.<br>Format:<br>`{`<br>`  "fieldName": "asc/desc"`<br>`}` |

### Headers

| Name           | Type   | Mandatory | Comment                                      |
| -------------- | ------ | --------- | -------------------------------------------- |
| `X-User-Id`    | String | Yes       | Unique identifier of the authenticated user. |
| `X-Auth-Token` | String | Yes       | Valid authentication token.                  |

---

### Request example

```js
getVisitorScreens(userId, authToken, queryParams) {
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

    return Axios.get(`${this.API_URL}/visitor-screens`, requestOptions)
        .then((response) => ({
            responseStatus: response.status,
            responseData: response.data,
        }))
        .catch((error) => {
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
        });
}
```

---

### Response example

```json
{
  "responseStatus": 200,
  "responseData": {
    "status": "success",
    "data": [
      {
        "_id": "AmEBNfbZMkChHyqXd",
        "name": "Example screen",
        "structureId": "qq4XeZRxf5RJqwEVp",
        "logoId": "C9iHGjo8mqt9QwvtS",
        "printType": "No visitor badge printing",
        "badgeLogoId": "",
        "disclaimer1": "Custom disclousre 1",
        "disclaimer2": "Custom disclousre w",
        "gdprId": "ntjupKnFxMBmksg72",
        "gdprText": "nda",
        "ndaId": "cGbziXFH5WsSPQJvt",
        "ndaText": "nda",
        "language": "en",
        "notificationLanguage": "en",
        "fullName": { "isEnabled": true, "isRequired": true },
        "email": { "isEnabled": true, "isRequired": true },
        "mobile": { "isEnabled": true, "isRequired": true },
        "organization": { "isEnabled": true, "isRequired": true },
        "carRegistrationNumber": { "isEnabled": true, "isRequired": false },
        "isSearchEmployeesEnabled": true,
        "isHostSelectionRequired": true,
        "isSmsEnabled": true,
        "isHostEmailEnabled": true,
        "checkOutTime": "20:00",
        "isAutomaticCheckOutEnabled": true,
        "isGuestWifiEnabled": false,
        "guestWifiPassword": "",
        "guestWifiSsid": "",
        "isSearchM365VisitorGroupEnabled": true,
        "m365VisitorGroup": "visitors",
        "timeZone": "Europe/Stockholm",
        "badgeOrientation": "portrait",
        "removeVisitorTime": null,
        "isAutomaticRemoveVisitorEnabled": false,
        "receptionDesk": "reception",
        "receptionDescription": "",
        "isManualCheckOutEnabled": true,
        "authenticationRequired": false,
        "licenseTier": "pro",
        "m365GroupSyncStatus": {
          "syncedAt": "2025-07-08T00:12:38+00:00",
          "error": ""
        },
        "address": {
          "enabled": true,
          "description": "Visitor screen location Torslanda\nGunnar Engellaus väg 8\n418 72 Göteborg\nSweden",
          "mapLinks": {
            "google": null,
            "apple": null
          }
        },
        "timeFormat": "HH:mm"
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

---

### Type of screen fields

| Name                                                                   | Type         | Comment                                            |
| ---------------------------------------------------------------------- | ------------ | -------------------------------------------------- |
| `_id`                                                                  | String       | Unique screen identifier                           |
| `name`                                                                 | String       | Screen name                                        |
| `structureId`                                                          | String       | Associated structure ID                            |
| `logoId`                                                               | String       | Logo image ID                                      |
| `printType`                                                            | String       | Badge print configuration                          |
| `badgeLogoId`                                                          | String       | Badge logo image ID                                |
| `disclaimer1`, `disclaimer2`                                           | String       | Custom disclaimers shown to visitors               |
| `gdprId`, `ndaId`                                                      | String       | Document template IDs                              |
| `gdprText`, `ndaText`                                                  | String       | Text content of GDPR/NDA                           |
| `language`                                                             | String       | Screen display language                            |
| `notificationLanguage`                                                 | String       | Language used in notifications                     |
| `fullName`, `email`, `mobile`, `organization`, `carRegistrationNumber` | Object       | Field configurations (`isEnabled`, `isRequired`)   |
| `isSearchEmployeesEnabled`                                             | Boolean      | Enable host search functionality                   |
| `isHostSelectionRequired`                                              | Boolean      | Require host selection on check-in                 |
| `isSmsEnabled`                                                         | Boolean      | Enable SMS notifications                           |
| `isHostEmailEnabled`                                                   | Boolean      | Enable host email notifications                    |
| `checkOutTime`                                                         | String       | Default auto check-out time (24h format)           |
| `isAutomaticCheckOutEnabled`                                           | Boolean      | Enable automatic check-out                         |
| `isGuestWifiEnabled`                                                   | Boolean      | Enable guest WiFi info                             |
| `guestWifiSsid`, `guestWifiPassword`                                   | String       | Guest WiFi credentials                             |
| `isSearchM365VisitorGroupEnabled`                                      | Boolean      | Enable filtering by Microsoft 365 groups           |
| `m365VisitorGroup`                                                     | String       | M365 group name                                    |
| `timeZone`                                                             | String       | Screen time zone                                   |
| `badgeOrientation`                                                     | String       | Badge layout direction (`portrait` or `landscape`) |
| `removeVisitorTime`                                                    | String\|Null | Time to auto-remove visitor (if enabled)           |
| `isAutomaticRemoveVisitorEnabled`                                      | Boolean      | Enable automatic visitor removal                   |
| `receptionDesk`                                                        | String       | Reception desk name                                |
| `receptionDescription`                                                 | String       | Reception description                              |
| `isManualCheckOutEnabled`                                              | Boolean      | Allow manual check-out                             |
| `authenticationRequired`                                               | Boolean      | Whether authentication is needed                   |
| `licenseTier`                                                          | String       | License tier (`pro`, `basic`, etc.)                |
| `m365GroupSyncStatus.syncedAt`                                         | String       | Last successful M365 group sync time               |
| `m365GroupSyncStatus.error`                                            | String       | M365 sync error message, if any                    |
| `address.enabled`                                                      | Boolean      | Whether to show address on screen                  |
| `address.description`                                                  | String       | Display address text                               |
| `address.mapLinks.google`                                              | String\|Null | Google Maps link                                   |
| `address.mapLinks.apple`                                               | String\|Null | Apple Maps link                                    |
| `timeFormat`                                                           | String       | Time display format (e.g., `HH:mm`)                |
