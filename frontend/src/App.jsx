import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Login from "./components/authcomponents/Login";
import Forgotpass from "./components/authcomponents/Forgotpass";
import Home from "./pages/Home";
import Resetpassword from "./components/authcomponents/Resetpass";
import DetectExpression from "./components/usercomponent/Facecapture";
import Navbar from "./components/usercomponent/Navbar";
import Contact from "./components/usercomponent/Contact";
import VerifyOtp from "./components/authcomponents/VerifyOtp";
import RegisterForm from "./components/authcomponents/RegisterForm";
import MusicPage from "./pages/Music";
import ExerciseList from "./components/ExerciseComponents/ExerciseList";
import ChooseVibe from "./components/usercomponent/ChooseVibe";
import ExerciseDetails from "./components/ExerciseComponents/ExerciseDetail";
import Video from "./pages/Videos";
import VideoPlayer from "./components/videocomponents/VideoPlayer";
import ProtectedRoute from "./components/ProtectedRoute";

function AppWrapper() {
  const location = useLocation();
  const hidenavbar = [
    "/login",
    "/register",
    "/reset-password",
    "/forgot-password",
    "/verify-otp",
  ];

  const showNavbar = !hidenavbar.includes(location.pathname);
  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<Forgotpass />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<Resetpassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/user-choice" element={<ChooseVibe />} />
          <Route path="/capture-face" element={<DetectExpression />} />
          <Route path="/musics" element={<MusicPage />} />
          <Route path="/exercise" element={<ExerciseList />} />
          <Route path="/exercise/:id" element={<ExerciseDetails />} />
          <Route path="/videos" element={<Video />} />
          <Route path="/videos/watch/:id" element={<VideoPlayer />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
