import { Route, Routes } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import Home from './components/Home'
import RegisterForm from './components/RegisterForm'
import MyProfile from './components/MyProfile'
import RegisterSuccess from './components/RegSuccess'
import PageNotFound from './components/PageNotFound';
import AllProfiles from './components/AllProfiles';
import UpdateProfile from './components/UpdateProfile';
import UpdateProfile4Admin from './components/UpdateProfileForAdmin';

import PrivateRoute from './utils/PrivateRoute';
import PublicRoute from './utils/PublicRoute';

function App() {

  return (
    <>
      <Routes>
          {/* Public Routes  */}
          <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />
          <Route path="/regsuccess" element={<RegisterSuccess />} />

          {/* Private Routes */}
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/myprofile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
          <Route path="/updateprofile" element={<PrivateRoute><UpdateProfile /></PrivateRoute>} />
          <Route path="/updateprofile4admin" element={<PrivateRoute><UpdateProfile4Admin /></PrivateRoute>} />
          <Route path="/allprofiles" element={<PrivateRoute><AllProfiles /></PrivateRoute>} />

          {/* Not found page for Undefined URLs  */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </>
      )
}

      export default App;
