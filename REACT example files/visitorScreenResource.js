import Axios from "axios";

import RequestError from "./requestError";

export default class VisitorLogsResource {
    API_URL = "https://localhost:3002/api/v1";

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
