import { Controller, Post, Req, Res } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PackageService } from './package.service';

@Controller('packages')
@ApiTags('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post('/')
  @ApiConsumes('application/octet-stream')
  @ApiBody({
    description: 'Zipped Ownable package',
    required: true,
  })
  async root(@Req() req: Request, @Res() res: Response): Promise<Response> {
    const buffer = req.body;
    if (!buffer) {
      return res.status(400).send('Failed to read data from HTTP request');
    }

    const cid = await this.packageService.store(buffer);

    return res.status(201).json({ cid });
  }
}
