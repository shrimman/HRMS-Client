import { createBrowserRouter, RouterProvider } from 'react-router-dom'
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
import HrCreateJobPage from './Pages/HrCreateJobPage'
import HrJobReferralsPage from './Pages/HrJobReferralsPage'
import HrJobShareLogsPage from './Pages/HrJobShareLogsPage'
import OrgChart from './Pages/OrgChart'
import AchievementFeed from './Pages/AchievementFeed'
import CreateNewPost from './Pages/CreateNewPost'
import EmployeeDirectory from './Pages/EmployeeDirectory'
import EmployeeProfile from './Pages/EmployeeProfile'
import { getEmployeeById } from './lib/api/hr'
import ManagerTeam from './Pages/ManagerTeam'
import TravelHistory from './Pages/TravelHistory'
import { getTravelPlanById } from './lib/api/travel'
import TravelPlanDetails from './Pages/TravelPlanDetails'
import PageNotFoundPage from './Pages/PageNotFoundPage'
import CreateTravelPlanPage from './Pages/CreateTravelPlanPage'
import HrTravelPlansPage from './Pages/HrTravelPlansPage'
import HrTravelPlanDetailsPage from './Pages/HrTravelPlanDetailsPage'

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
        path: '/hr/job/new',
        element: <HrCreateJobPage />,
      },
      {
        path: '/hr/jobs/:jobId/referrals',
        element: <HrJobReferralsPage />,
      },
      {
        path: '/hr/job-share-logs',
        element: <HrJobShareLogsPage />,
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
        path: '/manager/team',
        element: <ManagerTeam />,
      },
      {
        path: '/feed',
        element: <AchievementFeed />,
      },
      {
        path: '/create-post',
        element: <CreateNewPost />,
      },
      {
        path: '/myTravels',
        element: <TravelHistory />,
      }, 
      {
        path : '/createTravel',
        element : <CreateTravelPlanPage />
      },
      {
        path: '/hr/travels/created',
        element: <HrTravelPlansPage />,
      },
      {
        path: '/hr/travels/:travelId',
        element: <HrTravelPlanDetailsPage />,
      },
      {
        path: '/travel/:travelId',
        element: <TravelPlanDetails />,
        loader: ({ params }) => {
          const travelId = params.travelId;
          return getTravelPlanById(Number(travelId));
        }
      }
    ],
  },
  {
    path: '*',
    element: <PageNotFoundPage />,
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