import Axios from "axios";

export default class BookingsResource {
    API_URL = "https://localhost:3002/api/v1";

    getOrganizerBookings(userId, authToken, startDate, endDate) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {
                organizerUser: userId,
                startDate,
                endDate,
            },
        };

        return Axios.get(
            `${this.API_URL}/bookings`,
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
            { status: response.status, data: response.data }
        )).catch((error) => {
            const errorResponse = {
                status: error.response.status,
                data: error.response.data,
            };
            throw errorResponse;
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
            { status: response.status, data: response.data }
        )).catch((error) => {
            const errorResponse = {
                status: error.response.status,
                data: error.response.data,
            };
            throw errorResponse;
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
            { status: response.status, data: response.data }
        )).catch((error) => {
            const errorResponse = {
                status: error.response.status,
                data: error.response.data,
            };
            throw errorResponse;
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
