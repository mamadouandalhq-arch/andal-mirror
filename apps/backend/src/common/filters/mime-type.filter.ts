import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export function createMimeTypeFilter(allowedMimeTypes: string[]) {
  return (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new BadRequestException(
          `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
        ),
        false,
      );
    }

    cb(null, true);
  };
}
