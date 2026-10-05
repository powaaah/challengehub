export interface PostgresQueryClient {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
}

export interface PostgresTransactionalQueryClient extends PostgresQueryClient {
  transaction<T>(callback: (client: PostgresQueryClient) => Promise<T>): Promise<T>;
}
