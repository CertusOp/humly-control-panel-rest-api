import Axios from "axios";

import RequestError from "./requestError";

export default class DesksResource {
    const CLOUD_ID = "00000"; // Your 5 digit Humly cloud ID.
    const API_URL = `https://${COULD_ID}/api/v1`;

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

    getDesk(userId, authToken, deskId) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/desks/${deskId}`,
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
