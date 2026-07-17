import Axios from "axios";

import RequestError from "./requestError";

export default class UsersResource {
    constructor() {
        this.CLOUD_ID = "00000"; // Your 5 digit Humly cloud ID.
        this.API_URL = `https://${this.CLOUD_ID}.humly.cloud/api/v1`;
    }

    getAllUsers(userId, authToken, queryParams) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {
                name: queryParams.name,
                pageNumber: queryParams.pageNumber,
                pageSize: queryParams.pageSize,
                sort: queryParams.sort,
            },
        };

        return Axios.get(
            `${this.API_URL}/users`,
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

    getUser(userId, authToken, uniqueUserIdentifier) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/users/${uniqueUserIdentifier}`,
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

    createUser(userId, authToken, userData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.post(
            `${this.API_URL}/users`,
            userData,
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

    updateUser(userId, authToken, uniqueUserIdentifier, userData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.patch(
            `${this.API_URL}/users/${uniqueUserIdentifier}`,
            userData,
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

    deleteUser(userId, authToken, uniqueUserIdentifier) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.delete(
            `${this.API_URL}/users/${uniqueUserIdentifier}`,
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
