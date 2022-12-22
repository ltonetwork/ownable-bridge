import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/info')
  getInfo(): {
    name: string;
    version: string;
    description: string;
    env: string;
  } {
    return this.appService.getInfo();
  }
}
