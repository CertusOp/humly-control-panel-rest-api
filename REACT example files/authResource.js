import Axios from "axios";

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
            { status: response.status, data: response.data }
        )).catch((error) => {
            const errorResponse = {
                status: error.response.status,
                data: error.response.data,
            };
            throw errorResponse;
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
            { status: response.status, data: response.data }
        )).catch((error) => {
            const errorResponse = {
                status: error.response.status,
                data: error.response.data,
            };
            throw errorResponse;
        });
    }
}
