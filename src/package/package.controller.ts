import { Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PackageService } from './package.service';

@Controller('packages')
@ApiTags('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post('/')
  async root(@Req() req: Request): Promise<{ cid: string }> {
    const buffer = req.body;
    if (!buffer) throw new Error('Failed to read data from HTTP request');

    const cid = await this.packageService.store(buffer);
    return { cid };
  }
}
