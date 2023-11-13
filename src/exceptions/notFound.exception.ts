import { HttpExceptionOptions, NotFoundException } from '@nestjs/common';

export class LocalNotFoundException extends NotFoundException {
  constructor(item, id, error?: string | HttpExceptionOptions) {
    super(`${item} with id ${id} not found`, error);
  }
}
