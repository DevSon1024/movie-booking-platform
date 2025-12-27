# 🎬 MovieDeck - Movie Ticket Booking & Review Platform

> A full-stack MERN application for booking movie tickets, managing theatres, and submitting verified reviews. Built as a Final Year Major Project.

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![Status](https://img.shields.io/badge/Status-Incomplete-red)

## 🚀 Features

### 👤 User Module
* **Authentication:** Secure Login/Register using JWT & HTTP-Only Cookies.
* **Browse Movies:** View "Now Showing" and "Upcoming" movies.
* **Real-time Booking:** Select seats on a visual map.
* **My Tickets:** View booking history and status.
* **Verified Reviews:** Users can only review a movie *after* the show has ended (verified via algorithm).

### 🛠 Admin Module
* **Manage Movies:** Add/Update movies and their lifecycle (Upcoming -> Running -> Ended).
* **Manage Theatres:** Create theatres and screen layouts (Rows/Cols).
* **Manage Shows:** Schedule movies at specific times; seats are auto-generated.

### ⚙️ Technical Highlights
* **Seat Locking:** Atomic database operations to prevent double-booking.
* **Review Algorithm:** Logic checks `CurrentTime > ShowEndTime` to enable review capability.
* **State Management:** Redux Toolkit for global auth and movie state.
* **Security:** Password hashing (bcryptjs) and Protected Routes.

---

## 🏗 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Redux Toolkit |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens), Cookies |

---

## 🔧 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/yourusername/movie-booking-platform.git](https://github.com/yourusername/movie-booking-platform.git)
    cd movie-booking-platform
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create .env file and add your MONGO_URI
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the App**
    * Frontend: `http://localhost:5173`
    * Backend API: `http://localhost:5000`

---

## Screenshots
---

## 🔮 Future Scope
* Integration with Razorpay/Stripe for real payments.
* QR Code generation for tickets.
* Email notifications using Nodemailer.