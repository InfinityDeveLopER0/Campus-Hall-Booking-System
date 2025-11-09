# Campus-Hall-Booking-System
Campus Hall Booking & Approval System

A full-stack, 3-tier web application designed to modernize and automate the process of reserving event spaces within a university. This system replaces inefficient manual methods (like email chains and paper forms) with a centralized, role-based platform, ensuring a transparent and conflict-free scheduling process.

This project is currently an MVP (Minimum Viable Product) and is under active development.

🚀 Key Features

Full-Stack 3-Tier Architecture: A fully containerized application with a React frontend, Django (REST API) backend, and PostgreSQL database.

Role-Based Access Control (RBAC): Four distinct user roles, each with a unique dashboard and permissions:

Requester (Student/User)

Faculty

HOD (Head of Department)

Admin

Multi-Step Approval Workflow: A core feature of the system. Bookings must be approved through a formal chain of command:
Requester ➡️ Faculty ➡️ HOD ➡️ Admin ➡️ Approved/Rejected

Dynamic Dashboards: Each role sees a dashboard tailored to their needs (e.g., "My Bookings" for Requesters, "Approval Queue" for HODs).

Admin Management: Admins have full CRUD (Create, Read, Update, Delete) control over users, halls, and system-wide reports.

Fully Containerized: Deployed as a multi-container application using Podman and podman-compose, making it portable and easy to run on any machine.

Persistent Data: Uses a Podman volume (pg_data) to ensure all database data (users, halls, bookings) is safe and persists even if the containers are stopped or removed.

🛠️ Tech Stack

Area           Technology

Frontend:       React, TypeScript, Vite, TailwindCSS

Backend:        Django, Django REST Framework, Gunicorn

Database:       PostgreSQL

Deployment:     Podman, podman-compose, Nginx

🏗️ Architecture

This application runs as three interconnected services, defined in the podman-compose.yaml file:

frontend (React + Nginx): A production-built React app served by an Nginx container. It handles all user-facing UI and proxies API requests.

backend (Django + Gunicorn): A Django REST Framework API run by a Gunicorn server. It handles all business logic, user authentication, and the approval workflow.

db (PostgreSQL): The official PostgreSQL container, which stores all application data.

[ User (Browser: http://localhost:8080) ]
       |
[ frontend (Nginx Container) ]
       |
       |  (Proxies /api requests to...)
       V
[ backend (Django Container) ]
       |
       |  (Connects via 'db' hostname)
       V
[ db (PostgreSQL Container) ]


🚀 Getting Started: Running the Application

This project is designed to be built and run using Podman.

Prerequisites

Podman Desktop (This provides podman)

podman-compose (You can install this with pip install podman-compose)

Git

1. Clone the Repository

git clone [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git)
cd YOUR_REPOSITORY_NAME


2. Build and Run All Containers

This one command will build the frontend and backend images from their Containerfiles and start all three services. This will take several minutes on the first run.

podman-compose up --build


This terminal will fill with logs from all three containers. Leave this terminal running.

3. Initialize the Database (In a NEW Terminal)

The containers are running, but your new PostgreSQL database is empty. You must set it up.

Open a second, new terminal and run the following commands:

Run Migrations (Create tables):

podman-compose exec backend python manage.py migrate


Create Your Admin User:

podman-compose exec backend python manage.py createsuperuser
