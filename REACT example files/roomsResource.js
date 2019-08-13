import Axios from "axios";

export default class RoomsResource {
    API_URL = "https://localhost:3002/api/v1";

    getAllRooms(userId, authToken, queryParams) {
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
                minNumberOfSeats: queryParams.minNumberOfSeats,
                maxNumberOfSeats: queryParams.maxNumberOfSeats,
                includeBookings: queryParams.includeBookings,
                startBookings: queryParams.startBookings,
                endBookings: queryParams.endBookings,
            },
        };

        return Axios.get(
            `${this.API_URL}/rooms`,
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

    getRoom(userId, authToken, roomId) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/rooms/${roomId}`,
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

    getAvailableRooms(userId, authToken, queryParams) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
            params: {
                seats: queryParams.seats,
                startDate: queryParams.startDate,
                endDate: queryParams.endDate,
                location: queryParams.location,
                equipment: queryParams.equipment,
                customEquipment: queryParams.customEquipment,
            },
        };

        return Axios.get(
            `${this.API_URL}/rooms/available`,
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

    getRoomEquipment(userId, authToken, roomId) {
        const requestOptions = {
            headers: {
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.get(
            `${this.API_URL}/rooms/${roomId}/equipment`,
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

    reportRoomEquipment(userId, authToken, roomId, equipmentData) {
        const requestOptions = {
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
                "X-Auth-Token": authToken,
            },
        };

        return Axios.patch(
            `${this.API_URL}/rooms/${roomId}/equipment`,
            equipmentData,
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
