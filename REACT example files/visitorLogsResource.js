import Axios from "axios";

import RequestError from "./requestError";

export default class VisitorLogsResource {
    API_URL = "https://localhost:3002/api/v1";
    
    checkInVisitor(userId, authToken, visitorData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.post(
            `${this.API_URL}/visitor-logs`,
            visitorData,
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
