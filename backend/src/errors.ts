export class HttpError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
    }
}

export class AuthError extends HttpError {
    constructor(message: string = "Invalid Credentials") {
        super(401, message);
    }
}
export class ConflictError extends HttpError {
    constructor(message: string = "Conflicting Data") {
        super(409, message);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string = "Not Found") {
        super(404, message);
    }
}
