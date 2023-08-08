import Axios from "axios";

import RequestError from "./requestError";

export default class GuideScreensResource {
    API_URL = "https://localhost:3002/api/v1";

    // uniqueIdentifier -wayfinding document _id or code
    getGuideScreen(userId, authToken, uniqueIdentifier) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/wayFindings/${uniqueIdentifier}`,
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
