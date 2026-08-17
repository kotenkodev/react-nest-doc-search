import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { OPENSEARCH_CLIENT } from './search.provider';

describe('SearchService', () => {
  let service: SearchService;
  let mockOpenSearchClient: {
    index: jest.Mock;
    delete: jest.Mock;
    search: jest.Mock;
    indices: {
      exists: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    mockOpenSearchClient = {
      index: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
      indices: {
        exists: jest.fn(),
        create: jest.fn(),
      },
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

  it('should check if index exists', async () => {
    mockOpenSearchClient.indices.exists.mockResolvedValue({ body: true });
    const exists = await service.indexExists('documents');
    expect(exists).toBe(true);
    expect(mockOpenSearchClient.indices.exists).toHaveBeenCalledWith({
      index: 'documents',
    });
  });

  it('should create index if it does not exist', async () => {
    mockOpenSearchClient.indices.exists.mockResolvedValue({ body: false });
    mockOpenSearchClient.indices.create.mockResolvedValue({ body: {} });

    await service.createIndexIfNotExists('documents', { mappings: {} });

    expect(mockOpenSearchClient.indices.create).toHaveBeenCalledWith({
      index: 'documents',
      body: { mappings: {} },
    });
  });

  it('should not create index if it already exists', async () => {
    mockOpenSearchClient.indices.exists.mockResolvedValue({ body: true });

    await service.createIndexIfNotExists('documents', { mappings: {} });

    expect(mockOpenSearchClient.indices.create).not.toHaveBeenCalled();
  });
});
