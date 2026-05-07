# Tourista - AI-Powered Travel & Tourism Platform

**Author:** Hamza Bin Maqsood
**Project:** Final Year Design Project (FYDP) - BS Software Engineering

---

## 1. Project Vision

**Tourista** is a comprehensive, AI-driven travel ecosystem designed to provide a seamless, personalized, and safe travel experience in Pakistan, with an initial focus on the scenic regions of Azad Jammu & Kashmir (AJK) and Gilgit-Baltistan (GB).

The platform connects three key stakeholders:
*   **Tourists:** Receive personalized, AI-generated travel plans, booking capabilities for local services, and real-time assistance tools.
*   **Local Vendors:** Gain access to a digital marketplace to list their services (hotels, guides, transport) and connect directly with a targeted tourist audience.
*   **Administrators:** Ensure the quality, safety, and integrity of the platform by vetting vendors, monitoring system activity, and managing user feedback.

The core value proposition of Tourista is its deep integration of **AI-powered personalization**, which analyzes a user's unique travel style to generate bespoke itineraries, making travel planning intelligent, efficient, and enjoyable.

## 2. Core Features

### 👤 User & Vendor Features
*   **User Authentication:** Secure JWT-based registration, login, and logout with token blacklisting.
*   **Personalized Travel Profile:** Users can set their travel style (Adventure, Relaxation, etc.), budget, and language preferences.
*   **AI Itinerary Suggestions:** An AI engine recommends destinations based on the user's profile.
*   **Day-by-Day Itinerary Planner:** Users can create, view, and manage detailed trip plans.
*   **Service Booking:** Tourists can book services (hotels, guides) offered by local vendors.
*   **Vendor Registration & Management:** Local businesses can register, get verified by an admin, and manage their service listings.
*   **Secure In-App Messaging:** A dedicated system for tourists and vendors to communicate securely, protecting user privacy and platform integrity.

### 📍 Smart Mapping & Real-Time Alerts
*   **Route Optimization:** Integrates with OpenRouteService (ORS) to calculate the most efficient path between all points in an itinerary.
*   **Weather Alerts:** Provides real-time weather data for cities in an itinerary via the OpenWeatherMap API.
*   **Cultural Events Calendar:** Displays local festivals and events relevant to the user's travel dates and locations.

### 🛠️ Administrative & Technical Features
*   **Admin Dashboard:** A secure panel for administrators to approve/reject vendor applications and manage user feedback.
*   **Automated API Documentation:** Live, interactive API documentation powered by `drf-spectacular` (Swagger UI).
*   **Automated Testing:** Unit tests for critical functionalities like user registration to ensure code quality and reliability.
*   **Scalable Architecture:** Built with Django and PostgreSQL, ensuring a robust and scalable foundation.

## 3. Tech Stack

*   **Backend:** Python, Django, Django REST Framework
*   **Database:** PostgreSQL
*   **Authentication:** `djangorestframework-simplejwt` (with token blacklisting)
*   **API Documentation:** `drf-spectacular` (OpenAPI 3 / Swagger)
*   **External APIs:**
    *   OpenRouteService (Route Optimization)
    *   OpenWeatherMap (Weather Data)

## 4. Local Development Setup

Follow these steps to set up and run the project locally.

### Prerequisites
*   Python 3.8+
*   Miniconda or another virtual environment manager
*   PostgreSQL installed and running
*   Git

### Step-by-Step Installation
1.  **Clone the repository:**
    ```bash
    git clone [[Your-GitHub-Repository-URL]](https://github.com/Hamzabinmaqsood/tourista-backend/tree/main)
    cd tourista_fyp
    ```

2.  **Create and activate a Conda environment:**
    ```bash
    conda create --name tourista python=3.10
    conda activate tourista
    ```

3.  **Install project dependencies:**
    (It's a good practice to create a `requirements.txt` file)
    ```bash
    pip install -r requirements.txt
    ```
    *Note: If you don't have a `requirements.txt`, you can create one with `pip freeze > requirements.txt`.*

4.  **Configure the database:**
    *   Create a new PostgreSQL database and user for the project.
    *   Update the `DATABASES` setting in `core/settings.py` with your database credentials.

5.  **Set up environment variables:**
    *   In `core/settings.py`, add your API keys for:
        *   `OPENWEATHER_API_KEY`
        *   `OPENROUTESERVICE_API_KEY`

6.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```

7.  **Create a superuser account:**
    ```bash
    python manage.py createsuperuser
    ```

8.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```
    The backend will be running at `http://127.0.0.1:8000/`.

## 5. API Documentation

Once the server is running, you can access the live, interactive API documentation (Swagger UI) at:

**[http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)**

From this interface, you can view all available endpoints, see request/response formats, and execute API calls directly after authorizing with a user's Bearer token.

## 6. Running Tests

To ensure the reliability of the application, run the automated test suite:
```bash
python manage.py test
