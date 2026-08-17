export interface MessageHandler {
  canHandle(type: string): boolean;
  handle(payload: any): Promise<void>;
}
