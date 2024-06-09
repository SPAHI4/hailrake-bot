/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument */
import net from 'node:net';
import { setDefaultResultOrder } from 'node:dns';

import { APIGatewayProxyHandler } from 'aws-lambda';

import { bot } from '../bot.js';

setDefaultResultOrder('ipv4first');
net.setDefaultAutoSelectFamily(false);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body!);

    console.log('Received update:', body);

    await bot.handleUpdate(body);

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (error) {
    console.error('Error handling update:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process update' }),
    };
  }
};
