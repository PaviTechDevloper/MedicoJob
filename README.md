# MedicoJob: Advanced Medical Job Portal

MedicoJob is a production-grade medical recruitment platform designed for healthcare professionals and medical facilities. Built with a modern microservices architecture, it provides a seamless experience for finding talent and career opportunities in the healthcare sector.

## 🚀 Key Features

- **Dual-Track Portals**: Specialized dashboards for both Medical Professionals (Doctors/Nurses) and Healthcare Facilities (Hospitals/Clinics).
- **Advanced Job Search**: High-performance job listings with debounced search, real-time filtering (Specialization, Type, Location), and active filter management.
- **Application Tracking**: Real-time status updates (Applied, Shortlisted, Accepted, Rejected) for applicants and a "Review Queue" for employers.
- **Professional Profiles**: Deep profile management including experience, bio, license verification, and specialized skills to power recommendation engines.
- **Microservices Architecture**: 6 specialized backend services (User, Job, Matching, Availability, Location, Reputation) for high scalability.
- **Premium UI/UX**: Cinematic landing pages, cinematic login/register flows, and a "Command Center" dashboard aesthetic.

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind-inspired Vanilla CSS, Lucide Icons.
- **Backend**: Node.js, Express, Socket.io (Real-time updates).
- **Database**: MongoDB Atlas (Separate clusters per microservice).
- **Orchestration**: Concurrently & Dotenv-cli for monorepo management.

## 📦 Project Structure

```text
medicojob/
├── backend/
│   ├── user-service/         # Auth, Profile, and Verification
│   ├── job-service/          # Postings, Applications, and Search
│   ├── matching-service/     # Recommendation engine logic
│   ├── availability-service/ # Scheduling and shifts
│   ├── location-service/     # Geospatial clinic data
│   └── reputation-service/   # Reviews and ratings
├── frontend/                 # React SPA
└── package.json              # Monorepo orchestration
```

## 🚥 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Dee2909/Medicojob.git
   cd Medicojob
   ```
2. Install dependencies (Root and Sub-packages):
   ```bash
   npm install
   ```

### Execution
Launch the entire ecosystem (6 services + Frontend) with one command:
```bash
npm start
```

### 🔐 Demo Credentials
- **Doctor/User**: `applicant@medicojob.com` / `Demo123!`
- **Hospital/Clinic**: `hospital@medicojob.com` / `Demo123!`

## 🔧 Troubleshooting
If you encounter "Address already in use" errors:
```bash
pkill -f node
npm start
```

---
Developed by **MedicoJob Team** (2026)
