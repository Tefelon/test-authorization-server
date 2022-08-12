import {Injectable, UseFilters} from '@nestjs/common';
import {AllExceptionFilter} from "./exception-filters/exception.filter";

@UseFilters(AllExceptionFilter)
@Injectable()
export class AppService {

  getHello(): string {
    return 'Hello World!';
  }
}
