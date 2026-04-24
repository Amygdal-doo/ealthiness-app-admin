# Ealthiness Admin Portal

A comprehensive admin portal for the Ealthiness wellness platform with role-based authentication and global management capabilities.

## 🚀 Features

### 🔐 **Enhanced Login System**
- **Multi-role authentication** (Super Admin, Country Admin, Company Admin)
- **Visual role selection** with detailed permission previews
- **Secure form handling** with floating labels and password visibility toggle
- **Modern gradient UI** with animations and hover effects

### 📊 **Super Admin Dashboard**
- **Global platform metrics** with real-time statistics
- **Interactive charts** showing growth trends and regional performance
- **System health monitoring** with uptime and performance indicators
- **Activity distribution** visualization with pie charts
- **Quick action buttons** for common administrative tasks

### 🎨 **Modern UI Design**
- **Responsive layout** that works on all devices
- **Purple/blue gradient theme** with professional styling
- **Smooth animations** and micro-interactions
- **Card-based layout** with shadow effects and hover states

## 🛠️ Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📱 How to Use

### 1. **Login Process**
1. Select your admin role from the main login screen
2. Enter your credentials in the secure login form
3. Access role-specific dashboards and tools

### 2. **Super Admin Features**
- **Global Overview**: View platform-wide statistics and health scores
- **Regional Management**: Monitor performance across different regions
- **Quick Actions**: Add regions, manage companies, access user directory
- **System Monitoring**: Track alerts and recent platform activity

### 3. **Navigation**
- **Top Navigation**: Search, notifications, and user menu
- **Dashboard Cards**: Interactive metrics with trend indicators
- **Quick Actions Grid**: Fast access to administrative tools
- **Sidebar** (in full implementation): Navigate between different sections

## 🔧 Technical Details

### **Components Structure**
```
src/components/
├── LoginPage.jsx          # Enhanced authentication interface
├── HomePage.jsx           # Super admin dashboard
├── AdminApp.jsx          # Main app with state management
└── EalthinessAdminComplete.jsx  # Standalone version
```

### **Key Technologies**
- **React 19** with modern hooks and state management
- **Lucide React** for consistent iconography
- **Recharts** for interactive data visualizations
- **Tailwind CSS** for responsive styling
- **React Router** for navigation and routing

### **State Management**
- Authentication state (user role, login status)
- Navigation state (current view, active section)
- Dashboard data (metrics, charts, alerts)

## 🎯 Role-Based Access

### **Super Admin**
- Full platform access and global management
- View all regions, countries, and companies
- System administration and user management
- Advanced analytics and reporting

### **Country Admin** 
- Regional oversight and company management
- Monitor companies within assigned region
- User management for regional scope
- Regional analytics and reporting

### **Company Admin**
- Organization-level user management
- Company-specific wellness programs
- Employee analytics and engagement tools
- Internal reporting and metrics

## 🚀 Getting Started

1. **Start the development server**: `npm run dev`
2. **Open**: `http://localhost:5174/`
3. **Login**: Select "Super Admin" from the login screen
4. **Explore**: Navigate through the dashboard and quick actions

## 📊 Dashboard Features

### **Key Metrics Cards**
- Total active users across platform
- Global regions and companies count  
- Average health score platform-wide
- System uptime and reliability

### **Interactive Charts**
- **Growth Trends**: Platform growth over time with dual-axis charts
- **Regional Performance**: Bar charts showing user distribution
- **Activity Distribution**: Pie charts for exercise types
- **Health Analytics**: Line charts for wellness metrics

### **Management Tools**
- **System Alerts**: Priority-based notification system
- **Recent Activity**: Real-time activity feed
- **Quick Actions**: One-click access to admin functions
- **Search**: Global search across users and entities

## 🎨 Design System

- **Primary Colors**: Purple (#5850DE) and Blue (#248FEC) gradients
- **Typography**: Inter font family with multiple weights
- **Layout**: Card-based design with consistent spacing
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

---

**Built for the Ealthiness Platform** • Modern Admin Portal with Role-Based Access Control