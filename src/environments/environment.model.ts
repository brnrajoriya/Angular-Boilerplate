export interface Environment {
  /** Human readable name, shown in the UI footer. */
  readonly name: 'development' | 'stage' | 'production' | 'demo';
  readonly production: boolean;
  /** Base URL of the public API (auth endpoints live here). */
  readonly apiUrl: string;
  /** Base URL of the admin API (CRUD + file endpoints live here). */
  readonly adminApiUrl: string;
  /**
   * When `true`, an in-browser mock backend answers every API call.
   * Handy for local development and the static demo. Never enable it for a real release.
   */
  readonly useMockApi: boolean;
}
