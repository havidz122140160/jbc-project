# Javas Barber Connect (JBC) ✂️

## Project Overview
Javas Barber Connect (JBC) is a highly scalable, real-time Progressive Web Application (PWA) designed to revolutionize the traditional barbershop queueing and management system. Built with a robust architecture, JBC eliminates physical waiting times, prevents double-booking, and streamlines barbershop operations through a unified, role-based ecosystem.

## Core Technology Stack
- **Frontend:** React (Vite) with Tailwind CSS (Brutalist-Glassmorphism UI)
- **Backend:** Django Rest Framework (Business Logic & Orchestration)
- **Database & Real-time Engine:** PostgreSQL & Supabase (State Synchronization)

## System Architecture & Role-Based Workflows
The application is divided into three interconnected interfaces, tailored specifically for distinct user roles:

### 1. Customer Portal (Frictionless Booking & Live Queue)
- **Smart Scheduling:** Customers can intuitively book available slots for "Today, Tomorrow, or the Day After." The system dynamically hides time slots that are already reserved.
- **Live Ticket & Dynamic ETA:** Replaces traditional queue tokens. Customers view a real-time dashboard displaying their queue number, the currently served customer, and an auto-calculated Estimated Time of Arrival (ETA).
- **Real-Time Notifications:** Push notifications alert customers when their turn is approaching.

### 2. Kapster / Barber Terminal (One-Handed Operation)
- **Ergonomic Dark UI:** Designed for efficiency, the kapster interface features high-contrast, oversized action buttons that can easily be tapped with one hand while working.
- **3-Step Workflow:** Barbers manage the queue using three core actions: **Call** (notifies the next customer), **Start Session** (initiates a timer and updates the live queue), and **Complete** (logs the transaction and revenue).
- **No-Show Handling:** A built-in feature to skip unresponsive customers, ensuring the queue continues to move smoothly.

### 3. Owner Dashboard (Eagle-Eye Analytics & Control)
- **Real-Time Metrics:** Provides an immediate overview of daily revenue, total customers served, and active staff.
- **Performance Tracking:** A live leaderboard ranks kapsters based on completed sessions and generated revenue.
- **Emergency Override (God Mode):** Grants the owner absolute authority to manually block time slots, pause online reservations, or rearrange the queue during unexpected operational disruptions.

## Key System Integrity Features (Failsafes)
- **Anti-Race Condition:** Database-level unique constraints (combining `kapster_id`, `date`, and `time`) ensure that simultaneous booking attempts do not result in double-booked slots.
- **Seamless State Synchronization:** Leveraging Supabase's real-time listeners, any status update made by a kapster is instantly broadcasted to all active customer devices with zero lag.
- **Mobile-First Responsive Design:** The PWA is meticulously crafted to function like a native mobile app while maintaining an elegant, centered layout when accessed via desktop browsers.