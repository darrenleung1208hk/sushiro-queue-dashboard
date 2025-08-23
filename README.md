# 🍣 Sushiro Queue Dashboard

A real-time dashboard for monitoring Sushiro restaurant queue status across Hong Kong locations. Built with Next.js, TypeScript, and modern UI components.

## ✨ Features

- **Real-time Queue Monitoring**: Track waiting groups and current queue numbers for each store
- **Store Status Tracking**: Monitor which stores are open or closed
- **Multi-language Support**: Display store names in both Chinese and English
- **Regional Organization**: Stores organized by Hong Kong regions (香港島, 九龍, 新界)
- **Responsive Design**: Beautiful, modern UI that works on desktop and mobile
- **Live Updates**: Real-time timestamp tracking for queue data

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5.8](https://www.typescriptlang.org/)
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
│   ├── (ui)/                    # UI route group
│   │   └── dashboard/           # Dashboard page components
│   │       ├── _components/     # Dashboard-specific components
│   │       │   ├── DashboardError.tsx
│   │       │   ├── DashboardLoading.tsx
│   │       │   └── index.ts
│   │       └── page.tsx         # Dashboard page
│   ├── api/                     # API routes
│   │   └── stores/              # Store-related API endpoints
│   │       └── live/            # Live store data endpoint
│   │           └── route.ts
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page with dashboard
│   └── providers.tsx            # Context providers
├── components/                   # React components
│   ├── Dashboard.tsx            # Main dashboard component
│   ├── StoreCard.tsx            # Individual store card
│   └── ui/                      # shadcn/ui components
│       ├── accordion.tsx        # Collapsible content
│       ├── alert-dialog.tsx     # Alert dialogs
│       ├── alert.tsx            # Alert notifications
│       ├── aspect-ratio.tsx     # Aspect ratio wrapper
│       ├── avatar.tsx           # User avatars
│       ├── badge.tsx            # Status badges
│       ├── breadcrumb.tsx       # Navigation breadcrumbs
│       ├── button.tsx           # Button components
│       ├── calendar.tsx         # Date picker
│       ├── card.tsx             # Card containers
│       ├── carousel.tsx         # Image carousel
│       ├── chart.tsx            # Chart components
│       ├── checkbox.tsx         # Checkbox inputs
│       ├── collapsible.tsx      # Collapsible sections
│       ├── command.tsx          # Command palette
│       ├── context-menu.tsx     # Right-click menus
│       ├── dialog.tsx           # Modal dialogs
│       ├── drawer.tsx           # Slide-out drawers
│       ├── dropdown-menu.tsx    # Dropdown menus
│       ├── form.tsx             # Form components
│       ├── hover-card.tsx       # Hover cards
│       ├── input-otp.tsx        # OTP input
│       ├── input.tsx            # Text inputs
│       ├── label.tsx            # Form labels
│       ├── menubar.tsx          # Menu bars
│       ├── navigation-menu.tsx  # Navigation menus
│       ├── pagination.tsx       # Page navigation
│       ├── popover.tsx          # Popover content
│       ├── progress.tsx         # Progress bars
│       ├── radio-group.tsx      # Radio button groups
│       ├── resizable.tsx        # Resizable panels
│       ├── scroll-area.tsx      # Custom scrollbars
│       ├── select.tsx           # Select dropdowns
│       ├── separator.tsx        # Visual separators
│       ├── sheet.tsx            # Slide-out sheets
│       ├── sidebar.tsx          # Sidebar navigation
│       ├── skeleton.tsx         # Loading skeletons
│       ├── slider.tsx           # Range sliders
│       ├── sonner.tsx           # Toast notifications
│       ├── switch.tsx           # Toggle switches
│       ├── table.tsx            # Data tables
│       ├── tabs.tsx             # Tab navigation
│       ├── textarea.tsx         # Multi-line inputs
│       ├── toast.tsx            # Toast components
│       ├── toaster.tsx          # Toast container
│       ├── toggle-group.tsx     # Toggle button groups
│       ├── toggle.tsx           # Toggle buttons
│       └── tooltip.tsx          # Tooltips
├── lib/                         # Utility functions and hooks
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-mobile.tsx       # Mobile detection hook
│   │   └── use-toast.ts         # Toast management hook
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions
├── public/                      # Static assets
│   ├── favicon.ico             # Site favicon
│   ├── placeholder.svg          # Placeholder image
│   └── robots.txt              # SEO robots file
├── .vscode/                     # VS Code configuration
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── .prettierignore             # Prettier ignore patterns
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

## 🎨 UI Components

The dashboard uses a comprehensive set of UI components from shadcn/ui:

- **Cards**: Display store information
- **Badges**: Show store status and queue numbers
- **Progress bars**: Visual queue indicators
- **Accordions**: Collapsible store details
- **Responsive grid**: Adaptive layout for different screen sizes
- **Toast notifications**: User feedback and alerts
- **Dark/Light theme**: Theme switching capability

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
- `npm run lint` - Run ESLint

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

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

#### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

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
fix(dashboard): resolve queue number display issue
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
5. **Keep it concise**: Under 50 characters for the subject line
6. **Use body for detailed explanation**: If more context is needed

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

**Note**: This dashboard currently uses sample data. To integrate with real Sushiro queue data, you would need to connect to their API or implement a data fetching mechanism.
