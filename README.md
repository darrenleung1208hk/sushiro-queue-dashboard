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
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/)
- **State Management**: [TanStack Query](https://tanstack.com/query)

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
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page with dashboard
│   └── providers.tsx      # Context providers
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard component
│   ├── StoreCard.tsx      # Individual store card
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions and hooks
│   ├── hooks/           # Custom React hooks
│   └── utils.ts         # Utility functions
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## 🏪 Store Data Structure

Each store in the dashboard includes:

```typescript
interface Store {
  shopId: number;           // Unique store identifier
  storeStatus: "OPEN" | "CLOSED";  // Current store status
  waitingGroup: number;     // Number of people waiting
  storeQueue: string[];     // Current queue numbers
  timestamp: string;        // Last update timestamp
  name: string;            // Chinese store name
  nameEn: string;          // English store name
  address: string;         // Store address
  region: string;          // Hong Kong region
  area: string;            // District area
}
```

## 🎨 UI Components

The dashboard uses a comprehensive set of UI components from shadcn/ui:

- **Cards**: Display store information
- **Badges**: Show store status and queue numbers
- **Progress bars**: Visual queue indicators
- **Accordions**: Collapsible store details
- **Responsive grid**: Adaptive layout for different screen sizes

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Sushiro](https://www.sushiro.com.hk/) for the restaurant chain
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) team for the amazing framework

---

**Note**: This dashboard currently uses sample data. To integrate with real Sushiro queue data, you would need to connect to their API or implement a data fetching mechanism.
