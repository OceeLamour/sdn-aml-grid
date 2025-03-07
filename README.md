# SDN AML GRID

A comprehensive financial compliance platform for sanctions screening, risk assessment, and AML compliance.

## Project Overview

SDN AML GRID is a specialized compliance platform tailored for financial institutions, banks, fintech companies, and other regulated entities. The platform helps organizations stay compliant with global regulations by providing:

- **Real-time sanctions list monitoring** (OFAC, EU, UN, FATF)
- **AI-powered risk scoring and anomaly detection**
- **Automated alerts and notifications for high-risk activities**
- **Comprehensive compliance reporting and dashboards**
- **Seamless API integration with existing systems**

## Project Architecture

The project follows a microservices architecture with two main components:

### 1. SDN AML GRID (Main Platform)

The core dashboard application where users interact with compliance data, generate reports, and access AI-powered insights.

**Key Features:**
- User management and authentication
- Real-time sanctions screening
- AI-driven risk scoring
- Compliance reporting
- Automated alerts

### 2. AML-Web-Scraper (Microservice)

A separate microservice responsible for retrieving and normalizing sanctions data from regulatory sources.

**Key Features:**
- Scrapes sanctions lists from multiple sources
- Normalizes and processes regulatory data
- Provides APIs for querying entities
- Monitors for regulatory changes

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL (for data storage)
- Redis (for caching)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/OceeLamour/sdn-aml-grid.git
   cd sdn-aml-grid
   ```

2. Install dependencies for both components:
   ```
   # For the main platform
   cd sdn-aml-grid
   npm install

   # For the scraper microservice
   cd ../aml-web-scraper
   npm install
   ```

3. Configure environment variables:
   - Create `.env` files in both project directories based on the provided `.env.example` files

4. Start the development servers:
   ```
   # For the main platform
   cd sdn-aml-grid
   npm run dev

   # For the scraper microservice
   cd ../aml-web-scraper
   npm run dev
   ```

## Project Structure

```
/
├── sdn-aml-grid/         # Main React application
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── common/   # Reusable components
│   │   │   ├── core/     # Core components
│   │   │   └── features/ # Feature-specific components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── utils/        # Utility functions
│   │   ├── hooks/        # Custom React hooks
│   │   ├── styles/       # Global styles
│   │   ├── App.tsx       # Main App component
│   │   └── index.tsx     # Entry point
│   ├── public/           # Static assets
│   ├── package.json      # Dependencies for frontend
│   └── tsconfig.json     # TypeScript configuration
└── aml-web-scraper/      # Scraping microservice
    ├── src/
    │   ├── scrapers/     # Scraping logic
    │   ├── api/          # API routes
    │   ├── models/       # Data models
    │   └── utils/        # Utility functions
    ├── package.json      # Dependencies for scraper
    └── tsconfig.json     # TypeScript configuration
```

## Technologies

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express/FastAPI
- **Database:** PostgreSQL, Redis (caching)
- **State Management:** Redux/Context API
- **AI Integration:** TensorFlow, Python ML libraries
- **Deployment:** Docker, Kubernetes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
