import { createBrowserRouter } from 'react-router'
import Login from '../features/auth/pages/Login.jsx'
import Register from '../features/auth/pages/Register.jsx'
import ForgotPassword from '../features/auth/pages/ForgotPassword.jsx'
import Dashboard from '../features/chat/pages/Dashboard.jsx'
import Protected from '../features/auth/components/Protected.jsx'
import Verified from '../features/auth/components/Verified.jsx'

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/verify-email",
        element: <Verified />
    },
    {
        path: "/",
        element: <Protected ><Dashboard /> </Protected>
    }
])
