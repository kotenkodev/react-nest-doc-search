import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, filter, map } from 'rxjs';

export interface DocumentEventPayload {
  type: 'document.created' | 'document.updated' | 'document.deleted';
  ownerEmail: string;
  data: {
    id: string;
    status?: string;
    error?: string | null;
    [key: string]: any;
  };
}

@Injectable()
export class SseService {
  private readonly events$ = new Subject<DocumentEventPayload>();

  emit(event: DocumentEventPayload): void {
    this.events$.next(event);
  }

  getEventsStream(userEmail: string): Observable<MessageEvent> {
    return this.events$.asObservable().pipe(
      filter(
        (event) => event.ownerEmail.toLowerCase() === userEmail.toLowerCase(),
      ),
      map((event) => ({
        data: event,
      })),
    );
  }
}
