import { TelegramResponse } from './TelegramResponse.js';

export class HtmlResponse extends TelegramResponse {
  constructor(private readonly html: string) {
    super();
  }

  getPayload(): string {
    return this.html;
  }
}
