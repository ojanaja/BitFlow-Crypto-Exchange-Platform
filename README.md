# BitFlow - Crypto Exchange Platform

BitFlow is a modern, full-stack cryptocurrency exchange platform featuring real-time market data, portfolio management, and secure trading capabilities. Built with **Spring Boot** (Backend) and **Angular 16** (Frontend), it offers a premium, dark-themed user experience tailored for crypto traders.

![BitFlow Dashboard](https://github.com/user-attachments/assets/placeholder-image-url) 
*(Replace with actual screenshot)*

## 🚀 Features

*   **Real-time Market Data**: Live price updates via WebSocket (STOMP/SockJS) for major cryptocurrencies (BTC, ETH, SOL, etc.).
*   **Modern Trading Interface**: Premium dark-themed UI (Glassmorphism/Neon) built with Tailwind CSS.
*   **Portfolio Management**: Track your USD balance and crypto holdings dynamically.
*   **Secure Authentication**: JWT-based security with Spring Security 6.
*   **Order Execution**: Instant Buy/Sell order processing with transaction history.
*   **Dockerized Deployment**: Fully containerized setup with Docker Compose.

## 🛠 Tech Stack

### Backend
*   **Java 17** & **Spring Boot 3**
*   **Spring Security 6** (JWT Auth)
*   **WebSocket** (STOMP message broker)
*   **PostgreSQL** (Database)
*   **Spring Data JPA** (Hibernate)

### Frontend
*   **Angular 16**
*   **Tailwind CSS** (Custom Dark Theme)
*   **Angular Material** (Components)
*   **RxJS** (Reactive State Management)
*   **Chart.js** (Visualization)

## ⚙️ Installation & Setup

### Prerequisites
*   Docker & Docker Compose
*   Node.js 16+ (for local dev)
*   Java 17 JDK (for local dev)

### Quick Start (Docker)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/bitflow.git
    cd bitflow
    ```

2.  **Start the application:**
    ```bash
    docker-compose up -d --build
    ```

3.  **Access the Dashboard:**
    Open your browser and navigate to: [http://localhost](http://localhost)

### Local Development

#### Backend
```bash
cd backend
./mvnw spring-boot:run
```
*Server runs on: `http://localhost:8080`*

#### Frontend
```bash
cd frontend
npm install
npm start
```
*Client runs on: `http://localhost:4200`*

## 🔐 Default Credentials
*(For testing purposes)*

*   **Username**: `user`
*   **Password**: `password`
*   *(Or register a new account on the login screen)*

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
