# Admin Dashboard

A React-based admin dashboard with authentication and user management features, integrated with a REST API.

## Features

- **Authentication System**: Login/logout functionality with JWT token support
- **User Management**: View, edit, and manage user accounts
- **Profile Management**: Edit user profile information
- **Password Management**: Secure password change functionality
- **Responsive Design**: Modern UI built with Tailwind CSS
- **State Management**: Redux Toolkit for centralized state management
- **Protected Routes**: Route protection based on authentication status

## API Integration

The dashboard integrates with the following API endpoints:

- `GET /api/Account` - Get all accounts
- `POST /api/Account` - Create/login account
- `GET /api/Account/{id}` - Get account by ID
- `PUT /api/Account/{id}` - Update account
- `DELETE /api/Account/{id}` - Delete account
- `GET /api/Account/profile/{id}` - Get user profile
- `PUT /api/Account/change-password/{id}` - Change password

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- API server running on `http://localhost:5176`

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx     # Dashboard header with user info
│   ├── Sidebar.jsx    # Navigation sidebar
│   ├── Profile.jsx    # User profile management
│   └── ChangePassword.jsx # Password change form
├── pages/             # Page components
│   └── Login.js       # Login page
├── redux/             # Redux state management
│   ├── authSlice.js   # Authentication slice
│   └── store.js       # Redux store configuration
├── services/          # API services
│   └── api.js         # Axios configuration and interceptors
└── App.js             # Main application component
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Authentication Flow

1. User enters credentials on the login page
2. Credentials are sent to the API via POST `/api/Account`
3. On successful login, JWT token is stored in localStorage
4. User is redirected to the dashboard
5. All subsequent API calls include the token in Authorization header
6. On logout, token is removed and user is redirected to login

## State Management

The application uses Redux Toolkit for state management with the following slices:

- **authSlice**: Handles authentication state, user data, and API calls
  - User login/logout
  - Profile management
  - Password changes
  - Account operations

## Styling

The application uses Tailwind CSS for styling, providing:
- Responsive design
- Modern UI components
- Consistent color scheme
- Accessibility features

## API Configuration

The API base URL is configured in `src/services/api.js`. Update the `API_BASE_URL` constant if your API is running on a different port or host.

## Security Features

- JWT token-based authentication
- Automatic token inclusion in API requests
- Automatic logout on 401 responses
- Protected routes
- Form validation
- Secure password requirements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
