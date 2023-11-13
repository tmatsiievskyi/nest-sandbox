import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch() // all | single type | list or @UseFilters()
export class ExceptionsLoggerFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.log('Exception thrown', exception);
    super.catch(exception, host);
  }
}

// @Catch(NotFoundException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: NotFoundException, host: ArgumentsHost) {
//     const context = host.switchToHttp();
//     const response = context.getResponse<Response>();
//     const request = context.getRequest<Request>();
//     const status = exception.getStatus();
//     const message = exception.getMessage();

//     response
//       .status(status)
//       .json({
//         message,
//         statusCode: status,
//         time: new Date().toISOString(),
//       });
//   }
// }
