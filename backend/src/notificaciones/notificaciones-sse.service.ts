import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Injectable()
export class NotificacionesSseService implements OnModuleDestroy {
  private readonly streams = new Map<string, Subject<MessageEvent>>();

  getOrCreate(trabajadorId: string): Subject<MessageEvent> {
    if (!this.streams.has(trabajadorId)) {
      this.streams.set(trabajadorId, new Subject<MessageEvent>());
    }
    return this.streams.get(trabajadorId)!;
  }

  emit(trabajadorId: string, data: string | object): void {
    this.streams.get(trabajadorId)?.next({ data });
  }

  onModuleDestroy() {
    this.streams.forEach((s) => s.complete());
    this.streams.clear();
  }
}
