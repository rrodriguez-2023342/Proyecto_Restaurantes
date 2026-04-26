import { Toaster } from "react-hot-toast"
import { AppRoutes } from "./router/AppRoutes.jsx"

export const App = () => {
  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "inherit",
            fontWeight: 600,
            fontSize: "1rem",
            borderRadius: "8px"
          }
        }}
      />
      <AppRoutes />
    </>
  )
}
