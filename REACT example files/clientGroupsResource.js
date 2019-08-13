import Axios from "axios";

export default class ClientGroupsResource {
    API_URL = "https://localhost:3002/api/v1";

    createClientGroup(userId, authToken, clientGroupData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.post(
            `${this.API_URL}/clientGroups`,
            clientGroupData,
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
