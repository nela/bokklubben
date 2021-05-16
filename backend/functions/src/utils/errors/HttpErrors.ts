export abstract class HttpError extends Error {
    public status!: number;
    public message!: string;

    public constructor(status: number, message: string | object) {
        if (message instanceof Object) {
            super(JSON.stringify(message))
        } else {
            super(message);
        }
        this.status = status;
        //this.message = message;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class Http400Error extends HttpError {
    public readonly status = 400;
    public constructor(message: string | object = 'Bad Request') {
        super(400, message);
    }
}

export class Http401Error extends HttpError {
    public readonly status = 401;
    public constructor(message: string | object = 'Unauthorized') {
        super(401, message);
    }
}

export class Http403Error extends HttpError {
    public readonly status = 403;
    public constructor(message: string | object = 'Forbidden') {
        super(403, message);
    }
}

export class Http404Error extends HttpError {
    public status = 404;
    public constructor(message: string | object = 'Not Found') {
        super(404, message);
    }
}