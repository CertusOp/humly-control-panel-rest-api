import Axios from "axios";

import RequestError from "./requestError";

export default class SensorReadingsResource {
    const COULD_ID = "XXXXX.humly.cloud"
    const API_URL = `https://${COULD_ID}/api/v1`;

    getAllSensorReadings(userId, authToken, queryParams) {
        const paramsList = [
            "date",
            "type",
            "sensorId",
            "externalId",
            "status",
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
            `${this.API_URL}/sensor-readings`,
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

    getSensorReading(userId, authToken, readingId) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/sensor-readings/${readingId}`,
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

    addSensorReading(userId, authToken, sensorReadingData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.put(
            `${this.API_URL}/sensor-readings`,
            sensorReadingData,
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

    deleteSensorReading(userId, authToken, readingId) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.delete(
            `${this.API_URL}/sensor-readings/${readingId}`,
            requestOptions
        ).then(response => (
            { responseStatus: response.status, responseData: response.data }
        )).catch((error) => {
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
        })
    }
}
