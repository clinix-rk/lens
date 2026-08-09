import { HttpParams } from '@angular/common/http';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestOptions {
  pathParams?: Record<string, string | number | boolean | undefined | null>;
  queryParams?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  responseType?: 'json' | 'blob' | 'text';
}

export class ApiRoute {
  constructor(
    public readonly method: HttpMethod,
    public readonly path: string,
    public readonly operationId?: string
  ) {}

  buildUrl(
    baseUrl: string,
    pathParams?: Record<string, string | number | boolean | undefined | null>,
    queryParams?: Record<string, string | number | boolean | undefined | null>
  ): string {
    return ApiUrlBuilder.build(baseUrl, this.path, pathParams, queryParams);
  }
}

export class ApiUrlBuilder {
  static build(
    baseUrl: string,
    path: string,
    pathParams?: Record<string, string | number | boolean | undefined | null>,
    queryParams?: Record<string, string | number | boolean | undefined | null>
  ): string {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
    let resolvedPath = path.startsWith('/') ? path : `/${path}`;
    if (pathParams) {
      Object.entries(pathParams).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        resolvedPath = resolvedPath.replace(new RegExp(`\\{${key}\\}`, 'g'), encodeURIComponent(String(value)));
      });
    }

    if (resolvedPath.includes('{') || resolvedPath.includes('}')) {
      throw new Error(`Unresolved path params in API URL: ${resolvedPath}`);
    }

    const queryString = this.toQueryString(queryParams);
    return `${normalizedBaseUrl}${resolvedPath}${queryString}`;
  }

  static createParams(params?: Record<string, string | number | boolean | undefined | null>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) {
      return httpParams;
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      httpParams = httpParams.set(key, String(value));
    });

    return httpParams;
  }

  private static toQueryString(
    params?: Record<string, string | number | boolean | undefined | null>
  ): string {
    if (!params) {
      return '';
    }

    const filteredEntries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
    if (filteredEntries.length === 0) {
      return '';
    }

    const query = filteredEntries
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

    return `?${query}`;
  }
}
