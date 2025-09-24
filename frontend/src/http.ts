import axios, { AxiosResponse } from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const impersonate = localStorage.getItem('impersonate');
  const schedule = localStorage.getItem('schedule');

  if (impersonate) {
    config.headers['Authorization'] = `Token ${impersonate}`;
  } else if (token) {
    config.headers['Authorization'] = `Token ${token}`;
  }
  if (schedule) {
    config.headers['X-Schedule-ID'] = schedule;
  }
  return config;
});

export type ListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Params = Record<string, any>;

export class BaseModel<T = any> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async create(data: any): Promise<AxiosResponse<T>> {
    return http.post<T>(`${this.endpoint}`, data);
  }

  async get(id: number | string, params: Params = {}): Promise<AxiosResponse<T>> {
    return http.get<T>(`${this.endpoint}${id}/`, { params });
  }

  async list(params: Params = {}): Promise<AxiosResponse<ListResponse<T>>> {
    return http.get<ListResponse<T>>(`${this.endpoint}`, { params });
  }

  async all(params: Params = {}): Promise<T[]> {
    let results: T[] = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const pageParams = { ...params, page };

      try {
        const res = await this.list(pageParams);
        results = results.concat(res.data.results);
        hasNext = !!res.data.next;
        page++;
      } catch (err: any) {
        throw new Error(`Failed to fetch all resources: ${err.message}`);
      }
    }

    return results;
  }

  async update(id: number | string, data: any, patch = true): Promise<AxiosResponse<T>> {
    const method = patch ? 'patch' : 'put';
    return http.request({
      url: `${this.endpoint}${id}/`,
      method,
      data,
    });
  }

  async delete(id: number | string): Promise<AxiosResponse<undefined>> {
    return http.delete(`${this.endpoint}${id}/`);
  }

  async detailAction(
    id: number | string,
    action: string,
    method: string,
    data: any = {},
    params: Params = {}
  ): Promise<AxiosResponse<any>> {
    return http.request({
      url: `${this.endpoint}${id}/${action}/`,
      method,
      data,
      params,
    });
  }

  async listAction(action: string, method: string, data: any = {}, params: Params = {}): Promise<AxiosResponse<any>> {
    return http.request({
      url: `${this.endpoint}${action}/`,
      method,
      data,
      params,
    });
  }
}
