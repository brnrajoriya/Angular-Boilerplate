# Angular Ready-To-Go Boilerplate

[![CI](https://github.com/brnrajoriya/Angular-Boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/brnrajoriya/Angular-Boilerplate/actions/workflows/ci.yml)
[![Deploy](https://github.com/brnrajoriya/Angular-Boilerplate/actions/workflows/deploy.yml/badge.svg)](https://github.com/brnrajoriya/Angular-Boilerplate/actions/workflows/deploy.yml)

A production-ready **Angular 22** starter with the configuration every project needs already done:
authentication, guards, interceptors, a CRUD template, file upload, environments, theming, tests,
CI/CD and deployment.

**Live demo:** https://brnrajoriya.github.io/Angular-Boilerplate/ (runs on the built-in mock API).
Log in with `demo@example.com` / `Demo@1234`.

By [Bhaskar Rajoriya](https://www.linkedin.com/in/brnrajoriya/).

---

## Features

### UI

- **Angular Material 3** theme (`mat.theme`) with **light / dark / system** mode toggle
- **Bootstrap 5** grid + utility classes (`row`, `col-md-6`, `d-flex`, `gap-2`, ...) without Bootstrap's CSS reset fighting Material
- Responsive shell: toolbar, side navigation (overlay on mobile), global loading bar, toasts
- Accessible by default: skip link, labelled controls, `role="alert"` errors, reduced-motion support
- Route transitions with the native **View Transitions API**

### Application

- **Authentication** - login, registration, forgot / reset password (Signal Forms)
- **Session handling** - token + expiry stored safely, auto-logout when it expires, restore on reload
- **Guards** - `authGuard` (as `canMatch`, lazy chunks are not even downloaded) and `guestGuard`
- **Interceptors** - auth header, global error handling (401 → logout, toasts), loading bar, mock backend
- **CRUD template** - list with server-side pagination, sorting and search (state kept in the URL), create / edit form, details page, delete with confirm dialog
- **Generic `CrudService<T>`** - add a fully typed REST resource in 3 lines
- **File upload** - images / videos as `multipart/form-data` with live progress, previews, validation
- **Server validation** - Laravel-style `422` errors are shown under the matching form fields
- **Environments** - development, stage, production (+ demo) with file replacements
- **Mock API** - an in-browser backend so the app works without a server (dev + demo)

### Modern Angular (v22)

| Feature                                        | Where                                              |
| ---------------------------------------------- | -------------------------------------------------- |
| Standalone components, no NgModules            | everywhere                                         |
| Zoneless change detection (no `zone.js`)       | default since v21                                  |
| `OnPush` by default                            | default since v22                                  |
| Signals: `signal`, `computed`, `linkedSignal`  | services and components                            |
| Signal inputs + router input binding           | `?page=2` / `:id` → `input()`                      |
| `rxResource` for data loading                  | `dummy-list`, `dummy-detail`, `dummy-form`         |
| **Signal Forms** (`form`, `[formField]`, `[formRoot]`) | all forms                                  |
| Built-in control flow `@if` / `@for` / `@defer` | all templates                                     |
| Functional guards & interceptors, `inject()`   | `core/`                                            |
| `provideHttpClient(withFetch())`               | `app.config.ts`                                    |
| Lazy routes (`loadComponent` / `loadChildren`) + preloading | `app.routes.ts`                       |
| esbuild / Vite `application` builder           | `angular.json`                                     |
| Vitest unit tests                              | `*.spec.ts`                                        |
| Auto-generated strict **Content Security Policy** (`security.autoCsp`) | `angular.json`             |

## Prerequisites

- **Node.js** `^22.22.3`, `^24.15.0` or `>=26` (see `.nvmrc`)
- **npm** 10+

The Angular CLI is installed locally, use it through `npx ng ...` or the npm scripts below.

## Getting started

```bash
npm ci          # install exact dependency versions
npm start       # http://localhost:4200 with the mock API
```

Log in with `demo@example.com` / `Demo@1234`, or register a new account.
Mock data is kept in `localStorage`; clear site data to reset it.

## Scripts

| Command                 | What it does                                                     |
| ----------------------- | ---------------------------------------------------------------- |
| `npm start`             | Dev server (development environment, mock API, HMR)              |
| `npm run start:stage`   | Dev server with the stage environment                            |
| `npm run build`         | Production build → `dist/angular-boilerplate/browser`            |
| `npm run build:stage`   | Stage build (hidden source maps for error tracking)              |
| `npm run build:demo`    | Production build that uses the mock API (used for GitHub Pages)  |
| `npm test`              | Unit tests in watch mode (Vitest)                                |
| `npm run test:ci`       | Unit tests once                                                  |
| `npm run test:coverage` | Unit tests with coverage report in `coverage/`                   |
| `npm run lint`          | ESLint (TypeScript + templates + accessibility rules)            |
| `npm run format`        | Prettier                                                         |
| `npm run ci`            | Everything CI runs: format check, lint, tests, build             |

## Environments

| Configuration | File                                         | Command                    | API          |
| ------------- | -------------------------------------------- | -------------------------- | ------------ |
| development   | `src/environments/environment.development.ts` | `ng serve`                | mock (`/api`) |
| stage         | `src/environments/environment.stage.ts`      | `ng build -c stage`        | stage server |
| production    | `src/environments/environment.ts`            | `ng build`                 | prod server  |
| demo          | `src/environments/environment.demo.ts`       | `ng build -c production,demo` | mock      |

Each file exports the same typed `Environment` (`environment.model.ts`):

```ts
export const environment: Environment = {
  name: 'production',
  production: true,
  apiUrl: 'https://api.example.com/api', // auth endpoints
  adminApiUrl: 'https://api.example.com/api/admin', // CRUD + file endpoints
  useMockApi: false,
};
```

### Using your real backend

1. Set `apiUrl` / `adminApiUrl` in the environment files.
2. Set `useMockApi: false` in `environment.development.ts`.
3. During development `/api` is proxied to `http://localhost:8000` (`proxy.conf.json`), so there are no CORS issues.

The mock backend is loaded with a dynamic `import()`, so production builds never download it.

## Project structure

```
src/
├── app/
│   ├── core/                     # app-wide singletons (never imported by features' UI)
│   │   ├── auth/                 # AuthService, guards, auth interceptor, models, safe redirects
│   │   ├── http/                 # error + loading interceptors, HttpContext tokens, error helpers
│   │   ├── mock/                 # in-browser mock backend (dev / demo only)
│   │   └── services/             # notifications, theme, page title, storage
│   ├── shared/                   # reusable building blocks
│   │   ├── data/crud.service.ts  # generic REST resource client
│   │   ├── models/               # Paginated<T>, ListQuery, ...
│   │   ├── ui/                   # confirm dialog, field error, Material defaults
│   │   └── utils/                # toFormData, serverErrors
│   ├── layout/                   # shell (toolbar + sidenav) and auth layout
│   ├── features/                 # one folder per feature, lazy loaded
│   │   ├── auth/                 # login, register, forgot / reset password
│   │   ├── dummies/              # CRUD template - copy this for new resources
│   │   ├── uploads/              # file upload
│   │   ├── home/
│   │   └── not-found/
│   ├── app.config.ts             # providers: router, HttpClient, interceptors
│   ├── app.routes.ts             # top-level routes
│   └── app.ts                    # root component
├── environments/
├── index.html
├── main.ts
└── styles.scss                   # Material theme + global helpers
```

## API contract

The mock backend implements exactly this contract, so a real backend that follows it works as-is.
Errors use `{ "message": "...", "errors": { "field": ["..."] } }` (Laravel style).

| Method | URL                               | Body                                   | Response                       |
| ------ | --------------------------------- | -------------------------------------- | ------------------------------ |
| POST   | `{apiUrl}/auth/login`             | `{ email, password }`                  | `{ token, expires_in, user }`  |
| POST   | `{apiUrl}/auth/signup`            | `{ name, email, password }`            | `{ token, expires_in, user }`  |
| POST   | `{apiUrl}/auth/recovery`          | `{ email }`                            | `{ message }`                  |
| POST   | `{apiUrl}/auth/reset`             | `{ token, password, password_confirmation }` | `{ message }`            |
| GET    | `{adminApiUrl}/dummies`           | `?page&per_page&sort_by&order_by&keyword` | `Paginated<Dummy>`          |
| GET    | `{adminApiUrl}/dummies/{id}`      |                                        | `{ data: Dummy }`              |
| POST   | `{adminApiUrl}/dummies`           | `{ title, category, description }`     | `{ data: Dummy }`              |
| PATCH  | `{adminApiUrl}/dummies/{id}`      | partial                                | `{ data: Dummy }`              |
| DELETE | `{adminApiUrl}/dummies/{id}`      |                                        | `204`                          |
| POST   | `{adminApiUrl}/files`             | `multipart/form-data` with `file`      | `{ data: UploadedFile }`       |

`Paginated<T>` = `{ data, current_page, last_page, per_page, total, from, to }`.
Admin endpoints require `Authorization: Bearer <token>`; the interceptor adds it only to these two base URLs.

## Adding a new CRUD module

Example: a `products` resource.

**1. Model** - `src/app/features/products/product.model.ts`

```ts
export interface Product {
  id: number;
  name: string;
  price: number;
}
export type ProductPayload = Omit<Product, 'id'>;
```

**2. Service** - `src/app/features/products/product.service.ts`

```ts
@Injectable({ providedIn: 'root' })
export class ProductService extends CrudService<Product, ProductPayload> {
  protected readonly endpoint = `${environment.adminApiUrl}/products`;
}
```

You now have `list(query)`, `get(id)`, `create(payload)`, `update(id, payload)` and `delete(id)`.

**3. Components** - copy `features/dummies/*` and rename, or generate them:

```bash
npx ng g component features/products/product-list
npx ng g component features/products/product-form
npx ng g component features/products/product-detail
```

**4. Routes** - `src/app/features/products/products.routes.ts`

```ts
export default [
  { path: '', title: 'Products', loadComponent: () => import('./product-list/product-list') },
  { path: 'new', title: 'New product', loadComponent: () => import('./product-form/product-form') },
  { path: ':id', title: 'Product', loadComponent: () => import('./product-detail/product-detail') },
  { path: ':id/edit', title: 'Edit product', loadComponent: () => import('./product-form/product-form') },
] satisfies Routes;
```

**5. Register** it in `app.routes.ts` (inside the shell's `children`) and add a menu item in
`layout/shell/shell.ts`:

```ts
{ path: 'products', canMatch: [authGuard], loadChildren: () => import('./features/products/products.routes') },
```

Route params (`:id`) and query params (`?page=2`) arrive directly as component `input()`s.

## Security

- **Strict CSP**: production builds inject a hash-based `Content-Security-Policy` (`security.autoCsp`). Avoid inline scripts / `eval`.
- **Token scoping**: the `Authorization` header is only sent to `apiUrl` / `adminApiUrl`, never to third-party URLs.
- **Open-redirect protection**: `?returnUrl=` must be a same-app path (`safeRedirectUrl`).
- **No account enumeration**: the password-recovery flow answers the same for unknown emails.
- **XSRF**: Angular's `HttpClient` XSRF protection is on (cookie `XSRF-TOKEN` → header `X-XSRF-TOKEN`) for same-origin mutating requests.
- **Headers**: `nginx.conf` adds `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`; enable HSTS once you serve HTTPS only.
- Angular escapes all template bindings; do not bypass `DomSanitizer` without a review.

> The token is kept in `localStorage` (like the original boilerplate). For higher-risk apps prefer an
> `HttpOnly`, `Secure`, `SameSite` cookie issued by your backend, and remove the token handling from `AuthService`.

## Performance

- Initial bundle ≈ **110 kB** transferred; every page and Material component is lazy loaded.
- No `zone.js`, `OnPush` everywhere, signal-driven rendering.
- `MatSnackBar` and the mock backend are loaded on first use (dynamic `import()`).
- `@defer (on viewport)` on the home page feature grid.
- Lazy routes are preloaded after the first render (`PreloadAllModules`).
- Hashed file names + `immutable` caching in `nginx.conf`; `index.html` is never cached.
- Bundle budgets fail the build at 1 MB initial.

## Deployment

### GitHub Pages (demo)

`.github/workflows/deploy.yml` builds the demo configuration on every push to `master` and publishes it.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

### Docker (any server / cloud)

```bash
docker build -t angular-boilerplate .                                  # production
docker build -t angular-boilerplate --build-arg CONFIGURATION=stage .  # stage
docker run -p 8080:8080 angular-boilerplate                            # http://localhost:8080
```

The image serves the app with unprivileged nginx on port `8080`, SPA fallback, gzip, caching and
security headers, plus a `/healthz` endpoint.

### Other static hosts

Upload `dist/angular-boilerplate/browser/` and configure a rewrite of unknown paths to `/index.html`
(Netlify `_redirects`: `/* /index.html 200`, Firebase `"rewrites": [{ "source": "**", "destination": "/index.html" }]`,
Vercel `"rewrites": [{ "source": "/(.*)", "destination": "/" }]`). Use `--base-href /sub/path/` when not serving from the root.

## Upgrading from v1 (Angular 7)

| v1 (Angular 7)                           | v2 (Angular 22)                                         |
| ---------------------------------------- | ------------------------------------------------------- |
| `NgModule`s, `MaterialModule` barrel     | Standalone components importing only what they use      |
| `zone.js`, default change detection      | Zoneless, `OnPush`, signals                             |
| Template-driven `ngModel` forms          | Signal Forms with schema validation                     |
| Class guards / interceptors              | Functional guards / interceptors with `inject()`        |
| Eager routes, `/dummies/all/:page_no`    | Lazy routes, `/dummies?page=2&sortBy=title`             |
| `*ngIf` / `*ngFor`                       | `@if` / `@for` / `@defer`                               |
| TSLint, no tests                         | ESLint + Vitest + GitHub Actions                        |
| `node-sass`, Bootstrap 4, Font Awesome 4 | Dart Sass, Bootstrap 5, Material Symbols                |
| Webpack builder                          | esbuild application builder                             |

Bugs fixed on the way: list query params ignored `perPage`/`sortBy`/`orderBy`, the JWT interceptor
dropped all headers and forced `Content-Type: application/json` (breaking file uploads), CORS
response headers were sent as request headers, `objectToFormData` dropped `0`/`false`, the edit page
never loaded or saved, and the 401 handler used the removed `location.reload(true)`.

## License

MIT © Bhaskar Rajoriya
