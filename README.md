# Kamran Mekrani Trade (KMT)

![KMT Logo](frontend/public/logo.png)

A premium, private B2B wholesale gateway developed for automotive parts distribution.

## 🚀 Live Depoloyment

- **Frontend Application:** [https://kmt-1.onrender.com](https://kmt-1.onrender.com)
- **Backend API:** [https://kmt-9bcc.onrender.com](https://kmt-9bcc.onrender.com)

## 📌 Project Overview

Kamran Mekrani Trade operates a secure, gated wholesale environment designed for premium automotive workshops, retailers, and distributors. Features include:

- **Private Catalog:** Only verified buyers have access to high-performance parts.
- **Micro-Level Category Access:** Administrators can restrict visibility per buyer.
- **Advanced Auth:** Integrated Google Sign-In with supplementary data requirements.
- **Mobile First:** Glassmorphic layout optimized for cross-device usage.

## 🔑 Test Credentials 

All features are active on the live site. To explore the platform without applying for a new account, utilize the sandbox credentials below:

**Administrator Account**
Access the "Admin Dashboard" to approve users and view stats.
- **Email:** `mekranikamran@gmail.com`
- **Password:** `password123`

**Verified Buyer Account**
Immediate access to browse categories and submit purchase orders.
- **Email:** `approved@demo.com`
- **Password:** `password123`

## 🛠 Tech Stack

- **Frontend UI:** Vite, React, Zustand, Lucide React
- **Design:** Custom Vanilla CSS (Glassmorphism & Micro-animations)
- **Backend API:** Node.js, Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Authentication:** Custom JWT + Google OAuth 2.0

## 📂 Initialization Setup

If running locally for development:

```bash
# 1. Install Backend Dependencies & Start
cd backend
npm install
npm start

# 2. Install Frontend Dependencies & Start
cd frontend
npm install
npm run dev
```

*Note: You must have an active `.env` file referencing the specific MongoDB Atlas connection strings for full operability.*
