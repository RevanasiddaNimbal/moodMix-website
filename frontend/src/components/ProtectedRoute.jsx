import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isAuth = sessionStorage.getItem("isAuth");

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
