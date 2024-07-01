# ⚡ Next Finance

[![image](https://github.com/aldiyespaskalisbirta/next-finance/assets/84847746/919c6f12-b9bb-4bb0-b246-48871617d7d2)](http://vercel.com)

Next Finance is your comprehensive solution for managing personal and business finances. Track expenses, create budgets, analyze financial trends, and make informed decisions with our intuitive platform. Achieve your financial goals with ease and confidence using Next Finance.

## ⚙️ Features

- **Expense Tracking**: Easily record and categorize your expenses.
- **Budget Creation**: Create and manage budgets to keep your spending in check.
- **Financial Analysis**: Analyze your financial trends with detailed reports and charts.
- **Goal Setting**: Set and track financial goals to stay motivated and on track.
- **CSV Import**: Import your financial data from CSV files for seamless integration.
- **Database Seeding**: Seed the database with initial data for testing and development.
- **Secure and Private**: Your financial data is protected with top-notch security measures.
- **User Authentication**: Secure user authentication using Clerk.

## 🍵 Getting Started

Follow these steps to get started with Next Finance:

### 🖥️ Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aldiyespaskalisbirta/next-finance.git
   ```

2. Navigate to the project directory:

   ```bash
   cd next-finance
   ```

3. Copy Environtment variable:

   ```bash
   cp .env.example .env
   ```

4. Install the dependencies:
   ```bash
   bun install
   ```

### ⛅ Database Setup

1. Set up your Neon database. You can find more information and sign up at [Neon](https://neon.tech).

2. Configure the database connection in your environment variables:
   ```bash
   DATABASE_URL=your-neon-database-url
   ```

### 🤖 Generating the Database

To generate the database schema, run:

```bash
bun run db:generate
```

### ↔️ Migrating the Database

To apply the database migrations, run:

```bash
bun run db:migrate
```

### 🧾 Seeding the Database

To seed the database with initial data, run:

```bash
bun run db:seed
```

### Setting Up Authentication

1. Sign up for a Clerk account at Clerk.

2. Obtain your Clerk publishable key and secret key, then add them to your .env file:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

### 🛹 Running the Application

To start the development server, run:

```bash
bun run dev
```

Open http://localhost:3000 in your browser to see the application running.

## 🦖 Build for production

To build the project for production, run:

```bash
bun run build
```

## 🤙 Contributing

We welcome contributions from the community! If you'd like to contribute, please fork the repository and create a pull request with your changes. For major changes, please open an issue first to discuss what you would like to change.

## 📱 Contact

For any questions or suggestions, please contact us at aldiyes17032002@gmail.com.

Feel free to adjust any sections to better fit your project or add any additional information that might be relevant.
