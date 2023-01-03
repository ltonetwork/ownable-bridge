import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { OwnableService } from './ownable.service';
import { EventChain } from '@ltonetwork/lto';

@Controller('ownables')
export class OwnableController {
  constructor(private ownableService: OwnableService) {}

  @Post('/')
  async root(@Req() req: Request, @Res() res: Response): Promise<void> {
    const eventChainJson = req.body;
    if (!eventChainJson) {
      res.status(400).send('Failed to read event chain request');
      return;
    }

    let eventChain: EventChain;

    try {
      eventChain = EventChain.from(eventChainJson);
      eventChain.validate();
    } catch (e) {
      console.error(e);
      res.status(400).send('Invalid event chain');
      return;
    }

    await this.ownableService.accept(eventChain);
  }
}
