class BadRequestException {
    constructor()
    {
        this.message = "Bad Request: Empty or invalid payload";
        this.statusCode = 400;
    }
}
class AttributeMissingException {
    constructor(errors)
    {
        this.message = "Bad request: Following attributes in payload required: [" + errors + "]";
        this.statusCode = 400;
    }
}

BadRequestException.prototype = Object.create(Error.prototype);
AttributeMissingException.prototype = Object.create(Error.prototype);


exports.BadRequestException=BadRequestException;
exports.AttributeMissingException=AttributeMissingException;



