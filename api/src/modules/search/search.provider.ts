import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

export const OPENSEARCH_CLIENT = Symbol('OPENSEARCH_CLIENT');

export const openSearchClientProvider: Provider = {
  provide: OPENSEARCH_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const node = configService.getOrThrow<string>('aws.opensearch.node');
    const username = configService.getOrThrow<string>(
      'aws.opensearch.username',
    );
    const password = configService.getOrThrow<string>(
      'aws.opensearch.password',
    );

    return new Client({
      node,
      auth: { username, password },
      ssl: {
        rejectUnauthorized: false,
      },
    });
  },
};
