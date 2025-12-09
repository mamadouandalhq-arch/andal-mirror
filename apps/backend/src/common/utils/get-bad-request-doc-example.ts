import { BadRequestSwaggerDto } from '../../feedback/swagger';

export function getBadRequestDocExample(message: string) {
  return {
    message: message,
    error: 'Bad Request',
    statusCode: 400,
  } satisfies BadRequestSwaggerDto;
}
