import { EventEmitter } from 'events';

export class SimplePubSub {
  private ee: EventEmitter;

  constructor() {
    this.ee = new EventEmitter();
    this.ee.setMaxListeners(100);
  }

  async publish(triggerName: string, payload: unknown): Promise<void> {
    this.ee.emit(triggerName, payload);
  }

  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    const triggerNames = Array.isArray(triggers) ? triggers : [triggers];
    const pullQueue: Array<(value: IteratorResult<T>) => void> = [];
    const pushQueue: T[] = [];
    let listening = true;

    const pushValue = (event: T) => {
      if (pullQueue.length !== 0) {
        const resolve = pullQueue.shift()!;
        resolve({ value: event, done: false });
      } else {
        pushQueue.push(event);
      }
    };

    for (const trigger of triggerNames) {
      this.ee.on(trigger, pushValue);
    }

    const unsubscribe = () => {
      if (listening) {
        listening = false;
        for (const trigger of triggerNames) {
          this.ee.removeListener(trigger, pushValue);
        }
      }
    };

    return {
      next(): Promise<IteratorResult<T>> {
        if (!listening) {
          return Promise.resolve({ value: undefined as unknown as T, done: true });
        }
        if (pushQueue.length !== 0) {
          return Promise.resolve({ value: pushQueue.shift()!, done: false });
        }
        return new Promise(resolve => {
          pullQueue.push(resolve);
        });
      },
      return(): Promise<IteratorResult<T>> {
        unsubscribe();
        return Promise.resolve({ value: undefined as unknown as T, done: true });
      },
      throw(error): Promise<IteratorResult<T>> {
        unsubscribe();
        return Promise.reject(error);
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    } as AsyncIterator<T>;
  }
}

export const pubsub = new SimplePubSub();
