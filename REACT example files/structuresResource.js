import Axios from "axios";

import RequestError from "./requestError";

export default class StructuresResource {
    constructor() {
        this.CLOUD_ID = "00000"; // Your 5 digit Humly cloud ID.
        this.API_URL = `https://${this.CLOUD_ID}.humly.cloud/api/v1`;
    }

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
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
        });
    }
}
