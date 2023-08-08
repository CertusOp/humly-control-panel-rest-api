export default class RequestError extends Error {
    constructor(message, httpStatus, data) {
        super(message);
        this.httpStatus = httpStatus;
        this.data = data;
    }
}
