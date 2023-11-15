export type Listener = (data: any) => void;

class EventEmitter {
  private events: Record<string, Listener[]> = {};

  on(eventName: string, listener: Listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
  }

  emit(eventName: string, data: any) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((listener) => {
        listener(data);
      });
    }
  }

  off(eventName: string, listener: Listener) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(
        (existingListener) => existingListener !== listener
      );
    }
  }
}

const eventEmitter = new EventEmitter();

export default eventEmitter;
