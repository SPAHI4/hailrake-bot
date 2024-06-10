import * as casino from './casino/constants.js';
import * as rating from './rating/constants.js';
import { HtmlResponse } from './HtmlResponse.js';

export class ConfigsCommand {
  execute(): HtmlResponse {
    return new HtmlResponse(`
      <b>Casino</b>
      <pre>${JSON.stringify(casino, null, 2)}</pre>
      
      <b>Rating</b>
      <pre>${JSON.stringify(rating, null, 2)}</pre>
    `);
  }
}
