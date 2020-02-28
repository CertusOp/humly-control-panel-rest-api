import Axios from "axios";

export default class StructuresResource {
    API_URL = "https://localhost:3002/api/v1";

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
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }
}
