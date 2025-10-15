# Logout Implementation Guide

## Quick Implementation

To add logout functionality to your app, you can add a logout button to any component. Here's how:

### Option 1: Add to Header Component

Update `frontend/src/components/Header.jsx`:

```jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Inside your Header component:
const { isAuthenticated, logout, user } = useAuth();
const navigate = useNavigate();

const handleLogout = () => {
  logout();
  navigate('/');
};

// Add this button in your header JSX:
{isAuthenticated && (
  <button 
    onClick={handleLogout}
    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
  >
    Logout
  </button>
)}

// Optionally, show user info:
{isAuthenticated && user && (
  <span className="text-white mr-4">
    Welcome, {user.user?.email}
  </span>
)}
```

### Option 2: Add to Profile Page

Add logout button directly in your profile page:

```jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div>
      {/* Your profile content */}
      <button 
        onClick={handleLogout}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
      >
        Logout
      </button>
    </div>
  );
};
```

### What the Logout Function Does

The `logout()` function from AuthContext:
1. Removes `access_token` from localStorage
2. Removes `user` data from localStorage
3. Sets user state to `null`
4. You then manually navigate to home or login page

## Testing Logout

1. Login to your account
2. Click the logout button
3. Verify you're redirected
4. Try to access a protected route (like `/profile`)
5. You should be redirected to `/login`

## Automatic Logout on Token Expiry

The app automatically logs out when:
- The API returns a 401 Unauthorized error
- The token has expired
- User is automatically redirected to `/login`

This is handled by the axios interceptor in `frontend/src/services/api.js`.
