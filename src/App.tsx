import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import PublicLayout from '@/layouts/PublicLayout'
import MainLayout from '@/layouts/MainLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import LandingPage from '@/Pages/LandingPage'
import LoginPage from '@/Pages/LoginPage'
import SignupPage from '@/Pages/SignupPage'
import HomePage from '@/Pages/HomePage'
import ProfilePage from '@/Pages/ProfilePage'
import JobPage from './Pages/JobPage'
import JobReviewsPage from './Pages/JobReviewsPage'
import JobReferrals from './Pages/JobReferrals'
import OrgChart from './Pages/OrgChart'
import AchievementFeed from './Pages/AchievementFeed'
import CreateNewPost from './Pages/CreateNewPost'
import EmployeeDirectory from './Pages/EmployeeDirectory'
import EmployeeProfile from './Pages/EmployeeProfile'
import { getEmployeeById } from './lib/api/hr'

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup',
        element: <SignupPage />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/home',
        element: <HomePage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      }, {
        path: '/job',
        element: <JobPage />,
      },
      {
        path: '/job-reviews',
        element: <JobReviewsPage />,
      },
      {
        path: '/job-referrals',
        element: <JobReferrals />,
      },
      {
        path: '/org-chart',
        element: <OrgChart />,
      },
      {
        path: '/employee-directory',
        element: <EmployeeDirectory />,
      },
      {
        path: '/employee-directory/:employeeId',
        element: <EmployeeProfile />,
        loader: ({ params }) => {
          const employeeId = params.employeeId;
          return getEmployeeById(Number(employeeId));
        },
      },
      {
        path: '/feed',
        element: <AchievementFeed />,
      },
      {
        path: '/create-post',
        element: <CreateNewPost />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}

export default App