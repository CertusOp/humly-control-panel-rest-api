import Axios from "axios";

import RequestError from "./requestError";

export default class ServerInfoResource {
    const CLOUD_ID = "00000"; // Your 5 digit Humly cloud ID.
    const API_URL = `https://${COULD_ID}/api/v1`;

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
