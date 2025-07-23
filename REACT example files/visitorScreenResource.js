import Axios from "axios";

import RequestError from "./requestError";

export default class VisitorLogsResource {
    const CLOUD_ID = "00000.humly.cloud" // Your 5 digit Humly cloud ID.
    const API_URL = `https://${CLOUD_ID}/api/v1`;

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

        return Axios.get(
            `${this.API_URL}/visitor-screens`,
            requestOptions
        ).then((response) => ({
            responseStatus: response.status,
            responseData: response.data
        })).catch((error) => {
            throw new RequestError(
                error.response.data.message,
                error.response.status,
                error.response.data
            );
        });
    }
}
