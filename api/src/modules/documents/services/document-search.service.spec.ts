import { Test, TestingModule } from '@nestjs/testing';
import { DocumentSearchService } from './document-search.service';
import { SearchService } from '../../search/search.service';

describe('DocumentSearchService', () => {
  let service: DocumentSearchService;
  let searchService: jest.Mocked<SearchService>;

  beforeEach(async () => {
    const mockSearchService = {
      index: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
      indexExists: jest.fn(),
      createIndexIfNotExists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentSearchService,
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    }).compile();

    service = module.get<DocumentSearchService>(DocumentSearchService);
    searchService = module.get(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should ensure index on module init', async () => {
    await service.onModuleInit();
    expect(searchService.createIndexIfNotExists).toHaveBeenCalledWith(
      'documents',
      expect.objectContaining({
        mappings: expect.any(Object),
      }),
    );
  });

  it('should execute enhanced multi-clause search', async () => {
    searchService.search.mockResolvedValue({ hits: [], total: 0 });

    const result = await service.search('user@example.com', 'post');

    expect(searchService.search).toHaveBeenCalledWith(
      'documents',
      expect.objectContaining({
        query: expect.objectContaining({
          bool: expect.objectContaining({
            must: expect.any(Array),
            filter: expect.any(Array),
          }),
        }),
      }),
    );
    expect(result).toEqual({ hits: [], total: 0 });
  });

  it('should return empty result for blank query', async () => {
    const result = await service.search('user@example.com', '   ');
    expect(searchService.search).not.toHaveBeenCalled();
    expect(result).toEqual({ hits: [], total: 0 });
  });
});
