# Online Booking and Reservation System Documentation

## System Overview

This is a comprehensive booking and reservation system built with ASP.NET Core Web API backend and React.js frontend. The system supports both user-facing booking functionality and admin management capabilities.

## Architecture

### Backend (ASP.NET Core Web API)
- **Framework**: ASP.NET Core 8.0
- **Database**: SQL Server with Entity Framework Core
- **Port**: 5176 (http://localhost:5176)
- **API Documentation**: Swagger UI at `/swagger/index.html`

### Frontend (React.js)
- **Framework**: React with Redux Toolkit
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit with async thunks

## User Portal Flow

### 1. Service Discovery
**Entry Point**: User visits the main page
- **Service List**: Displays all available services with categories
- **Service Details**: Shows service information, pricing, and capacity
- **Filtering**: Users can filter by category, price range, or status

### 2. Service Selection
**User Action**: Click on a service to book
- **Service Information Display**:
  - Service name and description
  - Base price and capacity
  - Category information
  - Availability status

### 3. Booking Process
**Booking Form Flow**:

#### Step 1: Date and Time Selection
- **Calendar Interface**: Interactive calendar showing available dates
- **Date Availability**: 
  - Red dates = Booked/Unavailable
  - Blue dates = Selected
  - Gray dates = Available
- **Time Selection**: Start and end time inputs
- **Validation**: Ensures start time is before end time

#### Step 2: Contact Information
- **Required Fields**:
  - Full Name
  - Email Address
  - Phone Number (Ethiopian format: +251XXXXXXXXX)
- **Validation**: 
  - Email format validation
  - Phone number must start with +251 followed by 9 digits
  - All fields are required

#### Step 3: Booking Confirmation
- **Automatic Schedule Creation**: If no schedule exists for selected date/time
- **User Creation**: Automatically creates user account if not exists
- **Booking Creation**: Creates booking with service details
- **Error Handling**: Displays validation errors and API errors

### 4. Payment Process
**Payment Form**:
- **Booking Summary**: Shows booking details and total amount
- **Payment Methods**: Credit card, bank transfer, mobile money
- **Payment Processing**: Integration with payment gateway
- **Confirmation**: Payment success/failure handling

### 5. Booking Management
**User Dashboard**:
- **Booking History**: View all past and current bookings
- **Booking Status**: Pending, Confirmed, Cancelled, Completed
- **Booking Details**: Service, date, time, amount, status
- **Cancellation**: Ability to cancel bookings (with policy enforcement)

## Admin Portal Flow

### 1. Authentication & Authorization
**Login System**:
- **Admin Login**: Email/password authentication
- **Role-based Access**: Admin vs User permissions
- **Session Management**: Secure session handling

### 2. Dashboard Overview
**Admin Dashboard**:
- **Key Metrics**:
  - Total bookings
  - Revenue statistics
  - Service utilization
  - User registration trends
- **Quick Actions**: Common admin tasks
- **Recent Activity**: Latest bookings and user registrations

### 3. Service Management
**Service Administration**:

#### Service Creation
- **Service Details**:
  - Name and description
  - Category selection
  - Base price setting
  - Capacity configuration
  - Cancellation policy assignment
- **Status Management**: Available, Unavailable, Maintenance

#### Service Editing
- **Update Information**: Modify service details
- **Price Updates**: Adjust pricing
- **Status Changes**: Enable/disable services
- **Category Management**: Reassign categories

#### Service Deletion
- **Confirmation**: Prevent accidental deletion
- **Dependency Check**: Ensure no active bookings

### 4. User Management
**User Administration**:

#### User List View
- **User Display**: Name, email, phone, registration date
- **Search Functionality**: Search by name, email, or phone
- **Filtering Options**: All users, active users, inactive users
- **Pagination**: Handle large user lists

#### User Details
- **Contact Information**: Full name, email, phone, join date
- **Booking History**: Complete booking record for the user
- **Booking Details**: Service, date, time, status, amount
- **User Statistics**: Total bookings, total spent, average booking value

#### User Actions
- **Edit User**: Update contact information
- **Delete User**: Remove user account (with confirmation)
- **User Status**: Active/Inactive status management

### 5. Booking Management
**Booking Administration**:

#### Booking List
- **Booking Display**: User, service, date, time, status, amount
- **Filtering**: By status, date range, service, user
- **Search**: Find specific bookings
- **Sorting**: By date, amount, status

#### Booking Details
- **Complete Information**: All booking details
- **User Information**: Contact details and history
- **Service Information**: Service details and pricing
- **Schedule Information**: Date, time, and availability

#### Booking Actions
- **Status Updates**: Confirm, cancel, complete bookings
- **Schedule Management**: Modify booking times
- **Payment Tracking**: Payment status and history
- **Communication**: Send notifications to users

### 6. Schedule Management
**Schedule Administration**:

#### Schedule Creation
- **Service Assignment**: Link schedules to services
- **Time Configuration**: Start and end times
- **Date Management**: Single or recurring schedules
- **Status Control**: Available, Booked, Maintenance

#### Schedule Monitoring
- **Availability View**: Calendar view of all schedules
- **Booking Status**: See which schedules are booked
- **Conflict Detection**: Identify scheduling conflicts
- **Capacity Management**: Track service capacity

### 7. Payment Management
**Payment Administration**:

#### Payment Tracking
- **Payment Status**: Pending, Completed, Failed, Refunded
- **Payment Methods**: Track different payment types
- **Revenue Reports**: Financial summaries and analytics
- **Refund Processing**: Handle refund requests

#### Financial Management
- **Revenue Analytics**: Daily, weekly, monthly reports
- **Payment Processing**: Integration with payment gateways
- **Invoice Generation**: Create invoices for bookings
- **Tax Management**: Handle tax calculations

### 8. Category Management
**Category Administration**:

#### Category Operations
- **Create Categories**: Add new service categories
- **Edit Categories**: Modify category names and descriptions
- **Delete Categories**: Remove unused categories
- **Category Assignment**: Assign services to categories

### 9. Cancellation Policy Management
**Policy Administration**:

#### Policy Configuration
- **Notice Periods**: Set cancellation notice requirements
- **Refund Percentages**: Configure refund policies
- **Policy Assignment**: Link policies to services
- **Policy Updates**: Modify existing policies

## API Endpoints

### User Management
- `GET /api/User` - Get all users
- `GET /api/User/{id}` - Get user by ID
- `POST /api/User` - Create new user
- `PUT /api/User/{id}` - Update user
- `DELETE /api/User/{id}` - Delete user

### Booking Management
- `GET /api/Booking` - Get all bookings
- `GET /api/Booking/{id}` - Get booking by ID
- `POST /api/Booking` - Create new booking
- `PATCH /api/Booking/{id}/status` - Update booking status

### Service Management
- `GET /api/Service` - Get all services
- `GET /api/Service/{id}` - Get service by ID
- `POST /api/Service` - Create new service
- `PUT /api/Service/{id}` - Update service
- `DELETE /api/Service/{id}` - Delete service

### Schedule Management
- `GET /api/Schedule` - Get all schedules
- `GET /api/Schedule/{id}` - Get schedule by ID
- `POST /api/Schedule` - Create new schedule
- `PUT /api/Schedule/{id}` - Update schedule
- `DELETE /api/Schedule/{id}` - Delete schedule

### Payment Management
- `GET /api/Payment` - Get all payments
- `GET /api/Payment/{id}` - Get payment by ID
- `POST /api/Payment` - Create new payment
- `PUT /api/Payment/{id}` - Update payment

## Database Schema

### Core Entities
1. **Users**: User accounts and contact information
2. **Services**: Available services with pricing and capacity
3. **Schedules**: Time slots for services
4. **Bookings**: User reservations
5. **Payments**: Payment records
6. **Categories**: Service categories
7. **CancellationPolicies**: Cancellation rules

### Key Relationships
- Services belong to Categories
- Schedules belong to Services
- Bookings link Users, Services, and Schedules
- Payments belong to Bookings
- Services can have CancellationPolicies

## Security Features

### Authentication
- JWT token-based authentication
- Role-based access control
- Session management
- Password hashing

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

## Error Handling

### Frontend Error Handling
- Form validation errors
- API error responses
- Network connectivity issues
- User-friendly error messages

### Backend Error Handling
- Model validation errors
- Database constraint violations
- Business logic validation
- Structured error responses

## Performance Considerations

### Frontend Optimization
- Lazy loading of components
- Efficient state management
- Optimized API calls
- Responsive design

### Backend Optimization
- Database query optimization
- Caching strategies
- API response compression
- Connection pooling

## Deployment

### Backend Deployment
- IIS or Azure hosting
- Database migration scripts
- Environment configuration
- SSL certificate setup

### Frontend Deployment
- Static file hosting
- CDN integration
- Build optimization
- Environment variables

## Monitoring and Logging

### Application Monitoring
- Error tracking and reporting
- Performance metrics
- User activity logging
- System health checks

### Database Monitoring
- Query performance analysis
- Connection pool monitoring
- Backup and recovery
- Data integrity checks

## Future Enhancements

### Planned Features
- Email notifications
- SMS integration
- Advanced reporting
- Mobile app development
- Multi-language support
- Advanced analytics dashboard

### Technical Improvements
- Microservices architecture
- Real-time notifications
- Advanced caching
- API versioning
- Automated testing
- CI/CD pipeline 