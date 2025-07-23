import Axios from "axios";

import RequestError from "./requestError";

export default class SensorsResource {
    const CLOUD_ID = "00000"; // Your 5 digit Humly cloud ID.
    const API_URL = `https://${CLOUD_ID}/api/v1`;

    getAllSensors(userId, authToken, queryParams) {
        const paramsList = [
            "name",
            "type",
            "sensorId",
            "externalId",
            "pageNumber",
            "pageSize",
            "fields",
            "sort",
        ];
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {},
        };

        paramsList.forEach((param) => {
            if (queryParams[param]) {
                requestOptions.params[param] = queryParams[param];
            }
        });

        return Axios.get(
            `${this.API_URL}/sensors`,
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

    getSensor(userId, authToken, sensorId) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/sensors/${sensorId}`,
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

    createSensor(userId, authToken, sensorData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.post(
            `${this.API_URL}/sensors`,
            sensorData,
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

    updateSensor(userId, authToken, sensorId, sensorData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.put(
            `${this.API_URL}/sensors/${sensorId}`,
            sensorData,
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

    deleteSensor(userId, authToken, sensorId) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.delete(
            `${this.API_URL}/sensors/${sensorId}`,
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
