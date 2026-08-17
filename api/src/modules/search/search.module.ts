import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { openSearchClientProvider } from './opensearch.provider';

@Module({
  providers: [SearchService, openSearchClientProvider],
  exports: [SearchService],
})
export class SearchModule {}
