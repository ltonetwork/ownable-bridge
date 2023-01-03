import { Controller, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PackageService } from './package.service';

@Controller('packages')
@ApiTags('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post('/')
  async root(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<{ cid: string }> {
    const buffer = req.body;
    if (!buffer) {
      res.status(400).send('Failed to read data from HTTP request');
    }

    const cid = await this.packageService.store(buffer);
    return { cid };
  }
}
