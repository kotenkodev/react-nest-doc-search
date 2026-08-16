import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { OPENSEARCH_CLIENT } from './opensearch.provider';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const mockOpenSearchClient = {
      index: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: OPENSEARCH_CLIENT,
          useValue: mockOpenSearchClient,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
