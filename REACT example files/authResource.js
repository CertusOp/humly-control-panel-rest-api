import Axios from "axios";

import RequestError from "./requestError";

export default class AuthResource {
    API_URL = "https://localhost:3002/api/v1";

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
