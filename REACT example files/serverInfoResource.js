import Axios from "axios";

import RequestError from "./requestError";

export default class ServerInfoResource {
    API_URL = "https://localhost:3002/api/v1";

    getServerInfo(userId, authToken) {
        const requestOptions = {
            // optional
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/info`,
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
