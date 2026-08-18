# TSPL Forms & Workflow Platform

A secure, private internal form builder, approval workflow, and reporting platform built specifically for **TSPL Group**. It streamlines HR requests, operations, surveys, and multi-level approval queues in a single centralized system.

## Key Goals

- **Internal Operations**: Replace public form services to keep sensitive organizational data secure and internal.
- **Workflow & Approvals**: Integrate form submissions with manager and HR approval flows.
- **Data Integration**: Connect forms directly to TSPL Group branch, department, and employee directories.

## Detailed Features

A full list of standard fields, advanced widgets, access control mechanisms, and the phased rollout plan is documented in [FEATURES.md](file:///Users/atharvakrishnasalunkhe/Downloads/next-form-main/FEATURES.md).

## Getting Started

### Prerequisites

Ensure you have Node.js and a PostgreSQL instance configured.

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment file and fill in your credentials (database, Clerk auth, etc.):
   ```bash
   cp .env.example .env
   ```

3. Generate the Prisma database client:
   ```bash
   npx prisma generate
   ```

4. Push the schema to your database (if setting up for the first time):
   ```bash
   npx prisma db push
   ```

### Running the Application

- **Development Server**:
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Production Build**:
  ```bash
  npm run build
  npm run start
  ```

## License

This project is licensed under the MIT License. See [LICENSE.md](file:///Users/atharvakrishnasalunkhe/Downloads/next-form-main/LICENSE.md) for details.