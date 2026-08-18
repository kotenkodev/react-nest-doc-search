import {
  BadRequestException,
  Controller,
  MessageEvent,
  Query,
  Sse,
} from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse()
  streamEvents(@Query('email') email: string): Observable<MessageEvent> {
    if (!email) {
      throw new BadRequestException('Email query parameter is required');
    }
    return this.sseService.getEventsStream(email);
  }
}
