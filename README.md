# BSE Trades Dashboard

A real-time trade monitoring dashboard that simulates fetching trade data from a mock BSE API, stores the records in MongoDB, and streams live updates to connected dashboard clients using WebSockets.

## Features

- **Mock BSE API:** Provides paginated trade data with a configurable response delay.
- **Asynchronous data ingestion:** Starts trade pulls in the background without keeping the start request open.
- **Live dashboard updates:** Uses WebSockets to display newly fetched trades and pull progress without refreshing the page.
- **Persistent storage:** Stores trade records and pull-job details in MongoDB.
- **Duplicate prevention:** Uses trade IDs and database upserts to avoid duplicate records.
- **Pull protection:** Prevents multiple simultaneous pull jobs.
- **Progress tracking:** Displays processed records, total records, and completion percentage.
- **Recovery handling:** Detects pull jobs interrupted by a backend restart and marks them as failed.
- **Responsive interface:** Provides trade statistics, connection status, pull progress, and a paginated trades table.

## Technology Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- Axios
- Lucide React
- WebSocket

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- WebSocket (`ws`)
- Axios

## Architecture Overview

The application consists of four main parts:

1. **React Dashboard:** Displays stored trades, statistics, and real-time pull progress.
2. **Express Backend:** Exposes REST API endpoints for trade retrieval and pull-job management.
3. **Mock BSE API:** Supplies paginated trade records to simulate an external exchange API.
4. **MongoDB:** Stores trade records and pull-job information.

A background worker fetches trades in batches from the mock API and stores them in MongoDB. Once each batch is processed, the backend broadcasts updates through WebSockets to connected dashboard clients.

## Project Structure

```text
bse-trades-dashboard/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── pullController.js
│   │   └── tradeController.js
│   ├── models/
│   │   ├── PullJob.js
│   │   └── Trade.js
│   ├── routes/
│   │   ├── mockBseRoutes.js
│   │   ├── pullRoutes.js
│   │   └── tradeRoutes.js
│   ├── scripts/
│   │   └── seedTrades.js
│   ├── services/
│   │   └── mockBseData.js
│   ├── websocket/
│   │   └── socket.js
│   ├── workers/
│   │   └── pullWorker.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Prerequisites

Install the following before running the application:

- Node.js
- npm
- MongoDB Community Server
- Git

Make sure the MongoDB service is running before starting the backend.

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/labzz16/bse-trades-dashboard
cd bse-trades-dashboard
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory using `.env.example` as a reference.

Example configuration:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bse_trades_dashboard
BSE_PULL_DURATION_MS=900000
BSE_BATCH_SIZE=100
```

The default pull duration is 900000 milliseconds (15 minutes), with a batch size of 100 records.

### 3. Start the backend

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 4. Configure and start the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## API Endpoints

### Mock BSE API

| Method | Endpoint     | Description                            |
|--------|--------------|----------------------------------------|
| GET    | `/getTrades` | Retrieves paginated mock trade records |

### Trade APIs

| Method | Endpoint            | Description                             |
|--------|---------------------|-----------------------------------------|
| GET    | `/api/trades`       | Retrieves stored trades with pagination |
| GET    | `/api/trades/stats` | Retrieves trade statistics              |

### Pull Management APIs

| Method | Endpoint                  | Description                                 |
|--------|---------------------------|---------------------------------------------|
| POST   | `/api/pull/start`         | Starts an asynchronous trade pull           |
| GET    | `/api/pull/latest`        | Retrieves the latest pull job               |
| GET    | `/api/pull/status/:jobId` | Retrieves the status of a specific pull job |

### Health Check

| Method | Endpoint      | Description                 |
|--------|---------------|-----------------------------|
| GET    | `/api/health` | Checks backend availability |

## Real-Time Communication

The dashboard uses WebSockets to receive server-side updates without polling.

The backend broadcasts the following events:

- `PULL_STARTED` - A new pull job has started.
- `NEW_TRADES` - A new batch of trades has been stored.
- `PULL_PROGRESS` - Pull progress has been updated.
- `PULL_COMPLETED` - All records have been processed.
- `PULL_FAILED` - The pull job has failed.

## Data Ingestion Workflow

1. The user starts a pull from the dashboard.
2. The backend creates a pull job and immediately returns its job ID.
3. A background worker retrieves the total record count from the mock API.
4. The worker fetches records in batches.
5. Each batch is upserted into MongoDB.
6. WebSocket events notify connected dashboard clients about new trades and progress.
7. The job is marked as completed after all batches are processed.

## Database Collections

**Trades**

Stores trade records containing:
- Trade ID
- Client
- Symbol
- Quantity
- Price
- Timestamp

**Pull Jobs**

Stores ingestion job information, including:
- Job status
- Total records
- Processed records
- Active-job state
- Start and completion timestamps
- Error details, when applicable

## Production Build

To create a production build of the frontend:

```bash
cd frontend
npm run build
```

The generated production files are placed in the `frontend/dist` directory.

## Notes

- The mock BSE API generates sample trade data for local development and testing.
- The default configuration simulates a 15-minute pull.
- MongoDB must be running before the backend starts.
- Interrupted pull jobs are marked as failed when the backend restarts; automatic resumption is not implemented.
