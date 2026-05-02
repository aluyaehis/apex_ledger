# Apex Ledger API

A high-performance, secure core banking backend built with **Node.js**, **Express**, and **MySQL**. This API handles user authentication, digital wallet management, and secure peer-to-peer transfers using database transactions.



## Features

- **Secure Authentication**: JWT-based authorization with hashed passwords (bcrypt).
- **Automated Wallet Creation**: Every registered user automatically receives a digital wallet (NGN default).
- **ACID Transactions**: Financial operations (Deposits & Transfers) use SQL transactions to ensure data integrity.
- **Concurrency Control**: Implements `FOR UPDATE` row-locking to prevent race conditions during transfers.
- **Transaction History**: Full audit trail for every deposit and transfer.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **Security**: JSON Web Tokens (JWT), Bcrypt.js
- **Environment**: Dotenv for secure configuration

## API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/users/register` | Register user + create wallet |
| POST | `/api/users/login` | Login and receive Bearer Token |

### Wallet & Finance
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/wallets/balance` | Check current balance | Private |
| POST | `/api/wallets/deposit` | Fund wallet & log transaction | Private |
| POST | `/api/wallets/transfer` | P2P Transfer between users | Private |
| GET | `/api/wallets/history` | View account statement | Private |

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone url-to-repo
   cd apex-ledger-api