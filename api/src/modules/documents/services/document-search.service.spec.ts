import { Test, TestingModule } from '@nestjs/testing';
import { DocumentSearchService } from './document-search.service';
import { SearchService } from '../../search/search.service';

describe('DocumentSearchService', () => {
  let service: DocumentSearchService;

  beforeEach(async () => {
    const mockSearchService = {
      index: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
