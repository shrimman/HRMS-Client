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
import TravelExpense from './Pages/TravelExpense'
import CreateEditExpense from './Pages/CreateEditExpense'
import ExpenseDetails from './Pages/ExpenseDetails'
import HrExpenseList from './Pages/HrExpenseList'
import HrExpenseDetails from './Pages/HrExpenseDetails'
import ManagerPendingApprovals from './Pages/ManagerPendingApprovals'
import ManagerExpenseDetails from './Pages/ManagerExpenseDetails'
import { getExpenseById } from './lib/api/travelExpense'
import MyAchievementPosts from './Pages/MyAchievementPosts'

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
        path: '/signup',
        element: <SignupPage />,
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
        path: '/my-posts',
        element: <MyAchievementPosts />,
      },
      {
        path: '/myTravels',
        element: <TravelHistory />,
      },
      {
        path: '/createTravel',
        element: <CreateTravelPlanPage />
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
      },
      {
        path: '/travel-expenses',
        element: <TravelExpense />,
      },
      {
        path: '/travel-expenses/new',
        element: <CreateEditExpense />,
      },
      {
        path: '/travel-expenses/:expenseId',
        element: <ExpenseDetails />,
        loader: ({ params }) => {
          const expenseId = params.expenseId;
          return getExpenseById(Number(expenseId));
        }
      },
      {
        path: '/travel-expenses/:expenseId/edit',
        element: <CreateEditExpense />,
        loader: ({ params }) => {
          const expenseId = params.expenseId;
          return getExpenseById(Number(expenseId));
        }
      },
      {
        path: '/hr/travel-expenses',
        element: <HrExpenseList />,
      },
      {
        path: '/hr/travel-expenses/:expenseId',
        element: <HrExpenseDetails />,
        loader: ({ params }) => {
          const expenseId = params.expenseId;
          return getExpenseById(Number(expenseId));
        }
      }
      ,
      {
        path: '/manager/travel-expenses',
        element: <ManagerPendingApprovals />,
      },
      {
        path: '/manager/travel-expenses/:expenseId',
        element: <ManagerExpenseDetails />,
        loader: ({ params }) => {
          const expenseId = params.expenseId;
          return getExpenseById(Number(expenseId));
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