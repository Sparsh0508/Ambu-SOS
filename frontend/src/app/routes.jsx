import LandingPage from "../features/marketing/pages/LandingPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import CfrDashboardPage from "../features/cfr/pages/CfrDashboardPage";
import ActiveNavigationPage from "../features/driver/pages/ActiveNavigationPage";
import DriverDashboardPage from "../features/driver/pages/DriverDashboardPage";
import HospitalDashboardPage from "../features/hospital/pages/HospitalDashboardPage";
import HospitalProfilePage from "../features/hospital/pages/HospitalProfilePage";
import IncomingPatientPage from "../features/hospital/pages/IncomingPatientPage";
import LookingForDriverPage from "../features/patient/pages/LookingForDriverPage";
import LiveTripTrackingPage from "../features/patient/pages/LiveTripTrackingPage";
import PatientHomePage from "../features/patient/pages/PatientHomePage";
import PatientProfilePage from "../features/patient/pages/PatientProfilePage";
import RideHistoryPage from "../features/patient/pages/RideHistoryPage";
import TripDetailPage from "../features/patient/pages/TripDetailPage";
import { ProtectedRoute, PublicRoute } from "./route-guards";

export const appRoutes = [
  {
    element: <PublicRoute />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["USER"]} />,
    children: [
      { path: "/patient/home", element: <PatientHomePage /> },
      { path: "/patient/profile", element: <PatientProfilePage /> },
      { path: "/patient/history", element: <RideHistoryPage /> },
      { path: "/patient/trip/:tripId", element: <TripDetailPage /> },
      { path: "/patient/tracking/:tripId", element: <LiveTripTrackingPage /> },
      { path: "/patient/matching/:tripId", element: <LookingForDriverPage /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["DRIVER"]} />,
    children: [
      { path: "/driver/dashboard", element: <DriverDashboardPage /> },
      { path: "/driver/navigation/:tripId", element: <ActiveNavigationPage /> },
      { path: "/driver/profile", element: <PatientProfilePage /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["CFR"]} />,
    children: [
      { path: "/cfr/dashboard", element: <CfrDashboardPage /> },
      { path: "/cfr/profile", element: <PatientProfilePage /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["HOSPITAL_ADMIN"]} />,
    children: [
      { path: "/hospital/dashboard", element: <HospitalDashboardPage /> },
      { path: "/hospital/patient/:tripId", element: <IncomingPatientPage /> },
      { path: "/hospital/profile", element: <HospitalProfilePage /> },
    ],
  },
];
