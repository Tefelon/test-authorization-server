import {ArgumentsHost, ExceptionFilter, HttpException, HttpStatus} from "@nestjs/common";

export class AllExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): any {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        console.log(new Date().toISOString(), exception);

        if (status !== HttpStatus.INTERNAL_SERVER_ERROR) {
            return response.status(status).json(exception)
        } else {
            response.status(status).json({
                exception: exception.message,
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url
            })
        }
    }
}