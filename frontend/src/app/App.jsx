import { RouterProvider } from "react-router"
import { router } from "./app.routes"
import { useAuth } from "../features/auth/hook/useAuth.js"
import { useEffect } from "react"
import ThemeToggle from "./ThemeToggle.jsx"
import Toast from "./Toast.jsx"
function App() {
  const auth = useAuth();
  useEffect(()=>{
    auth.handleGetMe();
  },[])

  return (
    <>
      <ThemeToggle />
      <Toast />
      <RouterProvider router={router} />
    </>
  )
}

export default App
