export function getBadRequestDocExample(message: string) {
  return {
    message: message,
    error: 'Bad Request',
    statusCode: 400,
  };
}
