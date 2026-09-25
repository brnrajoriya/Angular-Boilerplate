export interface Environment {
  /** Human readable name, shown in the UI footer. */
  readonly name: 'development' | 'stage' | 'production' | 'demo';
  readonly production: boolean;
  /**
   * Base URL of the API, including the version prefix (Laravel API Boilerplate: `/api/v1`).
   * Endpoint paths and parameter names are configured in `app/core/api/api.config.ts`.
   */
  readonly apiUrl: string;
  /**
   * When `true`, an in-browser mock of the Laravel API Boilerplate answers every API call.
   * Handy for UI work without a backend and for the static demo. Never enable it for a real release.
   */
  readonly useMockApi: boolean;
}
