import { Controller, Get, Head, Param, Post, Req, Res } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiProduces } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { OwnableService } from './ownable.service';
import { Account, EventChain } from '@ltonetwork/lto';
import { eventChainExample } from './examples';
import { Signer } from '../common/http-signature/signer';
import { AuthError, UserError } from '../interfaces/error';

@Controller('ownables')
export class OwnableController {
  constructor(private service: OwnableService) {}

  @Post('/')
  @ApiConsumes('application/json', 'application/yaml')
  @ApiBody({
    schema: {
      type: 'object',
      example: eventChainExample,
    },
    description: 'Event chain',
    required: true,
  })
  async submit(@Req() req: Request, @Res() res: Response, @Signer() signer?: Account): Promise<Response> {
    const eventChainJson = req.body;
    if (!eventChainJson) {
      res.status(400).send('Failed to read event chain request');
      return;
    }

    try {
      await this.service.accept(EventChain.from(eventChainJson), signer);
      return res.status(201).send('Created');
    } catch (err) {
      return this.errorResponse(res, err);
    }
  }

  @Get('/:id')
  @ApiProduces('application/json')
  async claim(
    @Param('id') id,
    @Req() req: Request,
    @Res() res: Response,
    @Signer() signer?: Account,
  ): Promise<Response> {
    if (!(await this.service.exists(id))) {
      return res.status(404).send('Event chain not available on this bridge');
    }

    try {
      if (!(await this.service.isAllowedToClaim(id, signer))) {
        return res.status(403).send('Not allowed to claim');
      }

      const zip = await this.service.claim(id);
      return res.status(200).contentType('application/zip').send(zip);
    } catch (err) {
      return this.errorResponse(res, err);
    }
  }

  @Get('/:network/:address/:nft_id')
  async claimByNft(
    @Param('network') network,
    @Param('address') address,
    @Param('nft_id') nftId,
    @Req() req: Request,
    @Res() res: Response,
    @Signer() signer?: Account,
  ): Promise<Response> {
    const id = await this.service.getIdByNft({ network, address, id: nftId });

    if (!id) {
      return res.status(404).send('Event chain not available on this bridge');
    }

    try {
      if (!(await this.service.isAllowedToClaim(id, signer))) {
        return res.status(403).send('Not allowed to claim');
      }

      const zip = await this.service.claim(id);
      return res.status(200).contentType('application/zip').send(zip);
    } catch (err) {
      return this.errorResponse(res, err);
    }
  }

  private errorResponse(res: Response, err: any) {
    if (err instanceof AuthError) return res.status(403).send(err.message);
    if (err instanceof UserError) return res.status(400).send(err.message);

    console.error(err);
    return res.status(500).send('Unexpected error');
  }
}
