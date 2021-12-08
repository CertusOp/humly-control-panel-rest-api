import Axios from "axios";

export default class DesksResource {
    API_URL = "https://localhost:3002/api/v1";

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
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
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
            const errorResponse = {
                responseStatus: error.response.status,
                responseData: error.response.data,
            };
            throw errorResponse;
        });
    }
}
