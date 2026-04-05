# 🍣 Sushiro Queue Dashboard

A real-time dashboard for monitoring Sushiro restaurant queue status across Hong Kong locations. Built with Next.js, TypeScript, and modern UI components.

## ✨ Features

- **Real-time Queue Monitoring**: Track waiting groups and current queue numbers for each store
- **Store Status Tracking**: Monitor which stores are open or closed
- **Internationalization**: Full support for English and Traditional Chinese (Hong Kong) with language switcher
- **Advanced Filtering**: Search stores by name, filter by region, and filter by waiting status (Low/Medium/High/Extreme)
- **View Modes**: Toggle between grid and list views for optimal viewing experience
- **Statistics Overview**: Real-time statistics showing total stores, waiting groups, and active tickets
- **Auto-refresh**: Automatic data refresh every 60 seconds with manual refresh option
- **Regional Organization**: Stores organized by Hong Kong regions (香港島, 九龍, 新界)
- **Responsive Design**: Beautiful, modern UI that works on desktop and mobile
- **Live Updates**: Real-time timestamp tracking for queue data

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5.8](https://www.typescriptlang.org/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) for multi-language support
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/)
- **State Management**: React 19 with custom hooks
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes) for dark/light mode
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) for toast notifications

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/darrenleung1208hk/sushiro-queue-dashboard.git
   cd sushiro-queue-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
sushiro-queue-dashboard/
├── app/                          # Next.js App Router pages
│   ├── [locale]/                # Internationalized routes
│   │   ├── dashboard/           # Dashboard page
│   │   │   ├── _components/     # Dashboard-specific components
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── FiltersSection.tsx
│   │   │   │   ├── RefreshStatusBar.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   ├── StatsOverview.tsx
│   │   │   │   ├── StoreCard.tsx
│   │   │   │   ├── StoreDisplay.tsx
│   │   │   │   ├── StoreListItem.tsx
│   │   │   │   └── ViewModeHeader.tsx
│   │   │   └── page.tsx         # Dashboard page
│   │   ├── layout.tsx           # Locale-specific layout
│   │   └── page.tsx             # Locale-specific home page
│   ├── api/                     # API routes
│   │   └── stores/              # Store-related API endpoints
│   │       └── live/            # Live store data endpoint
│   │           └── route.ts
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Root page (redirects to locale)
│   └── providers.tsx            # Context providers
├── components/                   # React components
│   ├── LanguageSwitcher.tsx     # Language switcher component
│   └── ui/                      # shadcn/ui components
│       ├── badge.tsx            # Status badges
│       ├── button.tsx           # Button components
│       ├── card.tsx             # Card containers
│       ├── chart.tsx            # Chart components
│       ├── dropdown-menu.tsx    # Dropdown menus
│       ├── input.tsx            # Text inputs
│       ├── skeleton.tsx         # Loading skeletons
│       ├── sonner.tsx           # Toast notifications
│       ├── toast.tsx            # Toast components
│       ├── toaster.tsx          # Toast container
│       ├── tooltip.tsx          # Tooltips
│       ├── use-toast.ts         # Toast hook
│       └── view-toggle.tsx      # View mode toggle
├── i18n/                        # Internationalization config
│   └── request.ts               # next-intl request config
├── lib/                         # Utility functions and hooks
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-dashboard-filters.ts  # Dashboard filtering logic
│   │   ├── use-dashboard-stats.ts   # Dashboard statistics
│   │   ├── use-mobile.tsx       # Mobile detection hook
│   │   ├── use-toast.ts         # Toast management hook
│   │   └── use-view-mode.ts     # View mode state management
│   ├── constants.ts             # Application constants
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions (cn, etc.)
├── locales/                      # Translation files
│   ├── en.json                  # English translations
│   └── zh-HK.json               # Traditional Chinese (HK) translations
├── public/                      # Static assets
│   ├── favicon.ico             # Site favicon
│   ├── placeholder.svg          # Placeholder image
│   └── robots.txt              # SEO robots file
├── middleware.ts                 # Next.js middleware (i18n routing)
├── .eslintrc.json              # ESLint configuration
├── components.json              # shadcn/ui configuration
├── next.config.js              # Next.js configuration
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🏪 Store Data Structure

Each store in the dashboard includes:

```typescript
interface Store {
  shopId: number; // Unique store identifier
  storeStatus: 'OPEN' | 'CLOSED'; // Current store status
  waitingGroup: number; // Number of people waiting
  storeQueue: string[]; // Current queue numbers
  timestamp: string; // Last update timestamp
  name: string; // Chinese store name
  nameEn: string; // English store name
  address: string; // Store address
  region: string; // Hong Kong region
  area: string; // District area
}
```

## 🔌 API Endpoints

The dashboard provides a REST API for fetching live store queue data.

### GET `/api/stores/live`

Fetches live store data with queue information for all Sushiro stores in Hong Kong.

#### Query Parameters

All parameters are optional. If not provided, defaults for Hong Kong will be used:

- `latitude` (number, optional): Latitude coordinate for store search
  - Default: `22.3193` (Hong Kong)
- `longitude` (number, optional): Longitude coordinate for store search
  - Default: `114.1694` (Hong Kong)
- `numresults` (number, optional): Maximum number of stores to return
  - Default: `25`
- `region` (string, optional): Region code (e.g., 'HK' for Hong Kong)
  - Default: `'HK'`

#### Example Request

```bash
GET /api/stores/live?latitude=22.3193&longitude=114.1694&numresults=25&region=HK
```

#### Response Format

The API returns a JSON response with the following structure:

```typescript
{
  success: boolean;
  data: Store[];
  timestamp: Date; // Serialized as ISO 8601 string in JSON (e.g., "2025-08-27T10:13:15.814Z")
  message?: string;
  error?: string;
  warnings?: string[];
  partialData?: boolean;
  queueErrors?: Array<{ storeId: number; error: string }>;
}
```

**Note**: While the TypeScript interface uses `Date` type, timestamps are serialized as ISO 8601 formatted strings in the JSON response.

#### Response Status Codes

- `200 OK`: Successfully fetched complete data for all stores
- `206 Partial Content`: Store data available but queue data is unavailable for some stores
- `404 Not Found`: No stores found for the specified parameters
- `500 Internal Server Error`: An unexpected error occurred
- `503 Service Unavailable`: Store data is currently unavailable

#### Success Response Example

```json
{
  "success": true,
  "data": [
    {
      "shopId": 10,
      "name": "旺角店",
      "nameEn": "Mong Kok",
      "storeStatus": "OPEN",
      "waitingGroup": 83,
      "storeQueue": ["8312", "8304", "348"],
      "address": "香港九龍旺角彌敦道628號瓊華中心地庫",
      "region": "九龍",
      "area": "油尖旺區",
      "timestamp": "2025-08-27T10:13:15.814Z",
      "latitude": 22.3176566401426,
      "longitude": 114.17000769425294
    },
    {
      "shopId": 4,
      "name": "黃大仙店",
      "nameEn": "Wong Tai Sin",
      "storeStatus": "OPEN",
      "waitingGroup": 0,
      "storeQueue": [],
      "address": "香港九龍黃大仙龍翔道110號豪苑G3/F翔盈里5號舖",
      "region": "九龍",
      "area": "黃大仙區",
      "timestamp": "2025-08-27T10:13:15.814Z",
      "latitude": 22.342033,
      "longitude": 114.196866
    }
  ],
  "timestamp": "2025-08-27T10:13:15.814Z",
  "message": "Successfully fetched complete data for 25 stores"
}
```

**Note**: The example shows two stores:

- First store has an active queue with waiting groups and queue numbers
- Second store has no waiting groups (`waitingGroup: 0`) and an empty queue array
- Queue numbers are returned as strings and may include alphanumeric values (e.g., "8312", "8304", "8330-1")
- All timestamps are ISO 8601 formatted strings in the JSON response

#### Error Response Example

```json
{
  "success": false,
  "error": "STORE_DATA_UNAVAILABLE",
  "message": "Unable to fetch store information. Please try again later.",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": []
}
```

#### Partial Success Response Example

When queue data is unavailable for some stores:

```json
{
  "success": false,
  "data": [
    {
      "shopId": 1,
      "name": "壽司郎 銅鑼灣店",
      "storeStatus": "OPEN",
      "waitingGroup": 0,
      "storeQueue": [],
      ...
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Store data available but queue data is currently unavailable...",
  "error": "QUEUE_DATA_UNAVAILABLE",
  "partialData": true,
  "warnings": ["Queue data unavailable for 5 stores"]
}
```

#### Notes

- The API fetches data from Sushiro's external API through a CORS proxy
- Store list data is cached for 30 seconds (`revalidate: 30`)
- Queue data is cached for 15 seconds (`revalidate: 15`)
- Queue data is fetched in parallel with a concurrency limit of 5 stores at a time
- If queue data is unavailable for a specific store, the store will still be returned with an empty `storeQueue` array
- The API handles errors gracefully and continues processing other stores even if some fail
- Queue numbers in `storeQueue` are returned as strings and may include alphanumeric values (e.g., "8312", "8330-1", "348")
- Stores can have `waitingGroup: 0` and empty `storeQueue` arrays even when `storeStatus: "OPEN"` (indicating no current wait time)
- All timestamps are serialized as ISO 8601 formatted strings in the JSON response

## 🎨 UI Components

The dashboard uses a curated set of UI components from shadcn/ui:

- **Cards**: Display store information in grid and list views
- **Badges**: Show store status, queue numbers, and filter tags
- **Charts**: Visual statistics and data visualization
- **Input**: Search functionality for filtering stores
- **Dropdown Menu**: Language switcher and navigation
- **View Toggle**: Switch between grid and list view modes
- **Skeleton**: Loading states for better UX
- **Toast notifications**: User feedback and alerts via Sonner
- **Tooltips**: Helpful hover information

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:

- Desktop computers
- Tablets
- Mobile phones

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically on every push

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run Vitest in watch mode
- `npm run test:watch` - Alias for Vitest watch mode
- `npm run test:run` - Run unit tests once
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking without emitting files

## Testing

- Unit tests use Vitest.
- Logic-first tests are co-located as `*.test.ts` beside the module they cover.
- Keep pure, deterministic logic in plain `lib/` modules when it can be tested without rendering UI or calling the network.
- This setup is intentionally scoped to unit testing logic modules for now.
- Component tests, hook rendering tests, route integration tests, and browser/E2E tests are out of scope for this pass.

## 📋 Git Workflow & Standards

### Branching Strategy

We follow a simplified branching approach:

```
main                    # Production-ready code
├── develop            # Integration branch for features
    ├── feature/*      # Feature development branches
    └── fix/*          # Bug fix branches
```

#### Branch Naming Conventions

- **Feature branches**: `feature/descriptive-name`
  - Example: `feature/add-store-search`
- **Fix branches**: `fix/issue-description`
  - Example: `fix/queue-display-issue`

### Commit Message Standards

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification with a simplified format:

#### Commit Message Format

```
<type>: <description>
```

**Always use concise format without optional scope or body.**

#### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

#### Examples

```
feat: add store search functionality
fix: resolve queue number display issue
docs: update API documentation
style: format code with prettier
refactor: extract store card component
perf: optimize store data fetching
test: add unit tests for store utilities
chore: update dependencies
```

#### Commit Message Rules

1. **Use present tense**: "add feature" not "added feature"
2. **Use imperative mood**: "move cursor to..." not "moves cursor to..."
3. **Don't capitalize the first letter**: "add feature" not "Add feature"
4. **No period at the end**: "add feature" not "add feature."
5. **Keep it concise**: Use 1 sentence to conclude the changes
6. **Never use optional scope or body** - always use simple format: `<type>: <description>`

### Pull Request Process

1. **Create a feature/fix branch** from `develop`

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-fix-name
   ```

2. **Make your changes** and commit following the standards above

3. **Push your branch** to the remote repository

   ```bash
   git push origin feature/your-feature-name
   # or
   git push origin fix/your-fix-name
   ```

4. **Create a Pull Request** to merge into `develop`
   - Use a descriptive title
   - Fill out the PR template
   - Request reviews from team members

5. **Address feedback** and make necessary changes

6. **Merge** after approval and CI checks pass

### Git Hooks & Tools

- **Husky**: Pre-commit hooks for linting and formatting
- **Commitlint**: Enforces commit message conventions
- **Prettier**: Code formatting
- **ESLint**: Code quality and style enforcement

## 🤝 Contributing

1. Fork the repository
2. Create a feature or fix branch following our naming conventions
3. Make your changes following our coding standards
4. Commit your changes using conventional commit format
5. Push to your feature/fix branch
6. Open a Pull Request to `develop`
7. Ensure all CI checks pass
8. Request reviews from maintainers

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Keep PRs focused and small
- Add tests for new functionality
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Sushiro](https://www.sushiro.com.hk/) for the restaurant chain
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives

---

## 🔑 Environment Variables

The dashboard requires the following environment variables to fetch real Sushiro queue data:

- `CORS_PROXY_URL` - CORS proxy URL for API requests
- `SUSHIRO_STORE_LIST_API` - Sushiro store list API endpoint
- `SUSHIRO_QUEUE_API` - Sushiro queue data API endpoint

Create a `.env.local` file in the root directory with these variables to enable live data fetching.
