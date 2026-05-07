# Tourista – AI Powered Smart Tourism Platform

## Overview

Tourista is an AI-powered smart tourism platform developed as a Final Year Design Project (FYDP). The platform is designed to improve the travel experience through intelligent trip planning, smart recommendations, route optimization, personalized tourism assistance, and modern digital travel management.

The system combines mobile technology, intelligent recommendation systems, modern backend architecture, and real-world tourism use cases into a scalable full-stack platform.

Tourista aims to solve common travel-related problems such as:

* Poor trip planning
* Lack of personalized recommendations
* Communication barriers during travel
* Inefficient travel route management
* Fragmented tourism information
* Difficulty discovering relevant attractions and services
* Time wastage during travel planning

The project is being developed with scalability, maintainability, performance, and future AI integration in mind.

---

# Project Objectives

## Primary Objectives

* Build a modern full-stack tourism platform
* Provide AI-assisted travel planning
* Improve user travel experience through smart recommendations
* Enable efficient route and destination management
* Develop a scalable and secure tourism ecosystem

## Secondary Objectives

* Support personalized travel suggestions
* Integrate location and mapping services
* Improve tourism accessibility through digital solutions
* Enable future multilingual communication support
* Build a production-grade project architecture

---

# Key Features

## Current Features

* User authentication system
* Mobile application interface
* Django backend architecture
* PostgreSQL database integration
* API-based communication
* Modular project structure
* GitHub version control workflow

## Planned Features

* AI-powered itinerary generation
* Smart destination recommendations
* Real-time travel assistant
* Route optimization
* Hotel and restaurant recommendations
* Travel budget estimation
* Location-aware suggestions
* Tourism analytics dashboard
* Voice-based interaction
* Multilingual communication support
* Emergency travel assistance
* Weather integration
* Nearby attraction discovery
* Travel history and personalization

---

# Technology Stack

## Backend

| Technology            | Purpose             |
| --------------------- | ------------------- |
| Django                | Backend Framework   |
| Django REST Framework | API Development     |
| PostgreSQL            | Relational Database |
| Python                | Backend Programming |

## Frontend / Mobile

| Technology   | Purpose                        |
| ------------ | ------------------------------ |
| React Native | Mobile Application             |
| JavaScript   | Frontend Logic                 |
| Expo         | Mobile Development Environment |

## APIs & Services

| Service                | Purpose                     |
| ---------------------- | --------------------------- |
| OpenRouteService (ORS) | Maps & Route Optimization   |
| REST APIs              | Client-Server Communication |

## Development Tools

| Tool      | Purpose                 |
| --------- | ----------------------- |
| Git       | Version Control         |
| GitHub    | Repository Hosting      |
| VS Code   | Development Environment |
| Postman   | API Testing             |
| Miniconda | Environment Management  |

---

# System Architecture

```text
┌────────────────────────────┐
│      Mobile Application    │
│       (React Native)       │
└─────────────┬──────────────┘
              │ API Requests
              ▼
┌────────────────────────────┐
│        Django Backend      │
│     REST API Services      │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│      PostgreSQL Database   │
└────────────────────────────┘
              │
              ▼
┌────────────────────────────┐
│ External APIs & AI Services│
│  Maps, Routing, AI Models  │
└────────────────────────────┘
```

---

# Repository Structure

```text
Tourista/
│
├── tourista-mobile/          # React Native mobile application
├── tourista_fyp/             # Django backend project
├── .gitignore
└── README.md
```

---

# Backend Setup (Django)

## Clone Repository

```bash
git clone https://github.com/Hamzabinmaqsood/Tourista-FullStack.git
```

## Navigate to Backend

```bash
cd Tourista/tourista_fyp
```

## Create Virtual Environment

### Using Conda

```bash
conda create -n tourista python=3.10
conda activate tourista
```

### OR Using venv

```bash
python -m venv venv
```

Activate Environment:

#### Windows

```bash
venv\Scripts\activate
```

#### Linux/Mac

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Configure Environment Variables

Create a `.env` file:

```env
SECRET_KEY=your_secret_key
DEBUG=True
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
ORS_API_KEY=your_openrouteservice_api_key
```

## Database Migration

```bash
python manage.py makemigrations
python manage.py migrate
```

## Run Backend Server

```bash
python manage.py runserver
```

Backend default URL:

```text
http://127.0.0.1:8000/
```

---

# Mobile Application Setup (React Native)

## Navigate to Mobile App

```bash
cd Tourista/tourista-mobile
```

## Install Dependencies

```bash
npm install
```

## Start Expo Server

```bash
npx expo start
```

## Run on Android

```bash
npx expo run:android
```

## Run on iOS

```bash
npx expo run:ios
```

---

# Database Configuration

## PostgreSQL Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE tourista_db;
```

Update credentials inside `.env` file.

---

# Environment Variables

| Variable    | Description              |
| ----------- | ------------------------ |
| SECRET_KEY  | Django Secret Key        |
| DEBUG       | Debug Mode               |
| DB_NAME     | PostgreSQL Database Name |
| DB_USER     | PostgreSQL Username      |
| DB_PASSWORD | PostgreSQL Password      |
| DB_HOST     | Database Host            |
| DB_PORT     | Database Port            |
| ORS_API_KEY | OpenRouteService API Key |

---

# API Integration

Tourista uses API-driven architecture for:

* Mobile ↔ Backend communication
* Route calculations
* Smart travel planning
* External map services
* Future AI integrations

---

# AI Integration Vision

The future AI integration roadmap includes:

* Intelligent itinerary generation
* Conversational travel assistant
* Personalized destination recommendations
* AI-based travel preference analysis
* Smart travel budgeting
* Predictive tourism suggestions
* Natural language travel queries
* Voice-based interaction systems

---

# Security Considerations

The project follows basic secure development practices including:

* Environment variable protection
* API key isolation
* Database credential separation
* Git ignore rules for secrets
* Version control management
* Modular backend architecture

Future improvements planned:

* JWT authentication
* OTP verification
* OAuth login support
* Rate limiting
* API throttling
* Input validation hardening
* Production deployment security

---

# Git Workflow

## Main Branches

| Branch | Purpose                      |
| ------ | ---------------------------- |
| main   | Stable production-ready code |
| dev    | Active development branch    |

## Feature Branch Example

```bash
git checkout -b feature/auth-system
```

---

# Development Workflow

## Pull Latest Changes

```bash
git pull origin dev
```

## Create Feature Branch

```bash
git checkout -b feature/feature-name
```

## Commit Changes

```bash
git add .
git commit -m "Implemented feature"
```

## Push Changes

```bash
git push origin feature/feature-name
```

---

# Future Roadmap

## Phase 1

* Authentication System
* Core Mobile UI
* Backend APIs
* Database Design

## Phase 2

* AI Recommendation Engine
* Smart Route Planning
* Personalized Travel Suggestions
* Mapping Services

## Phase 3

* Voice Assistant
* Real-Time Features
* Travel Community Features
* Advanced Analytics

## Phase 4

* Production Deployment
* Cloud Infrastructure
* Scalable AI Services
* Internationalization

---

# Research & Academic Value

Tourista is not only a software engineering project but also a research-oriented smart tourism platform.

The project aligns with modern research domains including:

* Artificial Intelligence
* Smart Tourism
* Recommendation Systems
* Human-Computer Interaction
* Mobile Computing
* Intelligent Transportation Systems
* Digital Tourism Ecosystems
* AI-driven Personalization

---

# Contribution Guidelines

## General Rules

* Follow clean coding practices
* Write modular code
* Maintain consistent naming conventions
* Document major changes
* Avoid committing secrets or API keys
* Test features before pushing

---

# Common Git Commands

## Check Status

```bash
git status
```

## Pull Latest Changes

```bash
git pull
```

## Add Changes

```bash
git add .
```

## Commit Changes

```bash
git commit -m "Commit message"
```

## Push Changes

```bash
git push
```

---

# Deployment Vision

Future deployment targets may include:

* AWS
* Azure
* Railway
* Render
* DigitalOcean
* Firebase Services
* Docker-based deployment

---

# Screenshots

Screenshots and demo media will be added in future updates.

---

# License

This project is currently developed for academic and research purposes.

Future licensing decisions may be applied depending on project expansion.

---

# Project Maintainer

## Hamza Bin Maqsood

Software Engineer | Full Stack Developer

Areas of Interest:

* Artificial Intelligence
* Smart Tourism
* Backend Engineering
* Mobile Development
* Cybersecurity
* Cloud Technologies

GitHub Repository:

[https://github.com/Hamzabinmaqsood/Tourista-FullStack](https://github.com/Hamzabinmaqsood/Tourista-FullStack)

---

# Final Note

Tourista is being developed with the goal of building a scalable, intelligent, and user-centric tourism ecosystem capable of evolving into a real-world smart travel platform.

The project focuses not only on functionality but also on software engineering discipline, architecture quality, scalability, and future research potential.
