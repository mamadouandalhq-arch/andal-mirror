import { MIME_TO_EXT } from '../consts';
import { BadRequestException } from '@nestjs/common';

export function mimeToExt(mime: string) {
  const extension = MIME_TO_EXT[mime];

  if (!extension) {
    throw new BadRequestException('Unsupported file type');
  }

  return extension;
}
