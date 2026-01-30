const DEFAULT_PAGE_SIZE = 50;

export interface PaginationParam {
  offset?: number,
  limit?: number,
}

export interface PaginationResult<T> {
  rows: T,
  totalCount: number,
}

export function parsePaginationRequest(req: any): PaginationParam {
  if (Number.isInteger(req?.pageSize)) {
    if (req?.pageSize === -1) {
      return {};
    }
    else if (Number.isInteger(req?.pageNum) && req.pageNum >= 0) {
      return {
        offset: req.pageSize * req.pageNum,
        limit: req.pageSize,
      };
    }
    else {
      return {
        offset: 0,
        limit: req.pageSize,
      };
    }
  }
  else {
    return {
      offset: 0,
      limit: 50,
    };
  }
};