import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CommentService } from './comment-service';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request admin comments with status and dashboard filters', () => {
    let result: unknown;

    service.getAdminCommentsPage('APPROVED', 2, 8, '  Soft Chaos  ', '2026-04-01', '2026-04-20')
      .subscribe((response) => {
        result = response;
      });

    const request = httpMock.expectOne((req) =>
      req.method === 'GET'
      && req.url === '/api/comments/admin'
      && req.params.get('status') === 'APPROVED'
      && req.params.get('page') === '2'
      && req.params.get('size') === '8'
      && req.params.get('article') === 'Soft Chaos'
      && req.params.get('dateFrom') === '2026-04-01'
      && req.params.get('dateTo') === '2026-04-20'
    );

    request.flush({
      data: {
        content: [],
        pageNumber: 2,
        pageSize: 8,
        totalElements: 0,
        totalPages: 0,
        last: true,
      },
    });

    expect(result).toEqual({
      content: [],
      pageNumber: 2,
      pageSize: 8,
      totalElements: 0,
      totalPages: 0,
      last: true,
    });
  });

  it('should omit optional admin comment filters when they are blank or ALL', () => {
    service.getAdminCommentsPage('ALL', 0, 12, '   ', '', '').subscribe();

    const request = httpMock.expectOne((req) =>
      req.method === 'GET'
      && req.url === '/api/comments/admin'
      && req.params.get('page') === '0'
      && req.params.get('size') === '12'
      && !req.params.has('status')
      && !req.params.has('article')
      && !req.params.has('dateFrom')
      && !req.params.has('dateTo')
    );

    request.flush({
      data: {
        content: [],
        pageNumber: 0,
        pageSize: 12,
        totalElements: 0,
        totalPages: 0,
        last: true,
      },
    });
  });
});
