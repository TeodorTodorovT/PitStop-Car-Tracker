import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Header from './Header';

const AuthLayout = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#F3F8FF]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthLayout; 