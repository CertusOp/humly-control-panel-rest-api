import Axios from "axios";

import RequestError from "./requestError";

export default class BookingsResource {
    const COULD_ID = "00000.humly.cloud" // Your 5 digit Humly cloud ID.
    const API_URL = `https://${COULD_ID}/api/v1`;

    getOrganizerBookings(userId, authToken, queryParams) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {
                organizerUser: userId,
                startDate: queryParams.startDate,
                endDate: queryParams.endDate,
                pageNumber: queryParams.pageNumber,
                pageSize: queryParams.pageSize,
                sort: queryParams.sort,
            },
        };

        return Axios.get(
            `${this.API_URL}/bookings`,
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

    createBooking(userId, authToken, bookingData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.post(
            `${this.API_URL}/bookings`,
            bookingData,
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

    patchBooking(userId, authToken, bookingId, bookingData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.patch(
            `${this.API_URL}/bookings/${bookingId}`,
            bookingData,
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

    deleteBooking(userId, authToken, bookingId) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.delete(
            `${this.API_URL}/bookings/${bookingId}`,
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

    checkInBooking(userId, authToken, bookingId) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {
                bookingId,
            },
        };

        return Axios.put(
            `${this.API_URL}/bookings/checkedIn`,
            null,
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
