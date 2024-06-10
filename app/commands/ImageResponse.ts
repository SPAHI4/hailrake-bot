import { TelegramResponse } from './TelegramResponse.js';

const images = [
  'dota2/blademail.png',
  'dota2/daedalus.png',
  'dota2/lc_duel.png',
  'dota2/linken_sphere.png',
  'dota2/lotus_orb.png',
  'dota2/multicast.png',
  'dota2/multicast_x4.webp',
  'dota2/ogre_magi.png',
  'dota2/vanguard.png',
  'dota2/mekansm.png',
] as const;

export class ImageResponse extends TelegramResponse {
  constructor(
    private readonly image: (typeof images)[number],
    private readonly caption?: string,
  ) {
    super();
  }

  private getRelativePath(image: string): string {
    return `./assets/${image}`;
  }

  getPayload(): [string, string | null] {
    return [this.getRelativePath(this.image), this.caption ?? null];
  }
}
