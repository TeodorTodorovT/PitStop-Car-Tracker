import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import pitstopLogo from '../../assets/pitstop-only-text-logo.png';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center focus:outline-none"
            aria-label="Go to dashboard"
          >
            <img 
              src={pitstopLogo} 
              alt="PitStop Logo" 
              className="h-8 w-auto"
            />
          </button>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Header; 