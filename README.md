# Dare Arqam

## Requirements

- PHP 8.4 or newer
- Composer 2
- Node.js 22 or newer
- npm 10 or newer
- SQLite (used by the default project setup)

## First setup on a new laptop

Run these commands from the project directory:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item -ItemType File database/database.sqlite -Force
php artisan migrate --force
php artisan db:seed
npm ci
npm run build
php artisan optimize:clear
php artisan serve --host=127.0.0.1 --port=8000
```

Open <http://127.0.0.1:8000/>.

Do not copy `public/hot` or `node_modules` between laptops. The built frontend lives in
`public/build`, which is generated with `npm run build`.

## Development

For a development server, run two terminals:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
npm run dev
```

Before testing the production build locally, stop `npm run dev` and remove the generated
development marker:

```powershell
Remove-Item public/hot -ErrorAction SilentlyContinue
npm run build
php artisan serve --host=127.0.0.1 --port=8000
```

## Production deployment

Set `.env` to production values and keep secrets outside Git:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.example
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

Run:

```powershell
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan optimize
```

Configure the web server document root to `public/`, enable HTTPS, and schedule
`php artisan schedule:run` at one-minute intervals if scheduled tasks are used.
