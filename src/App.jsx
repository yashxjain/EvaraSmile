import './assets/libs/boxicons-2.1.1/css/boxicons.min.css';
import './scss/App.scss';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './evarasmilecomponents/auth/AuthContext';
import theme from './evarasmilestyles/theme';

// Admin-related imports
import Blank from './pages/Blank';
import Dashboard from './pages/Dashboard';
import MainLayout from './layout/MainLayout';
import Products from './pages/Products';
import ProductDetails from './pages/ProductsDetails';
import LoginForm from './pages/LoginForm';
import UsersList from './pages/UserList';
import OrdersList from './pages/OrderList';
import EditOrder from './pages/EditOrder';
import Stock from './pages/Stock';
import Offer from './pages/Offer';
import UserDetail from './pages/UserDeatail';
import OrderProduct from './pages/OrderProduct';
import ProductRequestList from './pages/ProductRequestList';

// Evara Smile-related imports
import Login from './evarasmilepages/Login';
import EvaraSmileDashboard from './evarasmilepages/Dashboard';
import Employee from './evarasmilepages/Employee';
import Holiday from './evarasmilepages/Holiday';
import Policy from './evarasmilepages/Policy';
import Attendance from './evarasmilepages/Attendance';
import Notification from './evarasmilepages/Notification';
import Leave from './evarasmilepages/Leave';
import Expense from './evarasmilepages/Expense';
import EmpProfile from './evarasmilepages/User';
import PrivateRoute from './evarasmilecomponents/auth/PrivateRoute';
import EmployeeProfile from './evarasmilepages/EmployeeProfile';
import Visit from './evarasmilepages/Dealer';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);

        // Disable right-click context menu globally
        const handleRightClick = (event) => {
            event.preventDefault();
        };
        document.addEventListener('contextmenu', handleRightClick);

        return () => {
            document.removeEventListener('contextmenu', handleRightClick);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Admin Module Routes */}
                        <Route path="/admin" element={<LoginForm setIsAuthenticated={setIsAuthenticated} />} />
                        {isAuthenticated ? (
                            <Route path="/admin" element={<MainLayout handleLogout={handleLogout} />}>
                                <Route index element={<Dashboard />} />
                                <Route path="/admin/orders" element={<OrdersList />} />
                                <Route path="/admin/order-detail/:orderId" element={<EditOrder />} />
                                <Route path="/admin/products" element={<Products />} />
                                <Route path="/admin/product/:medicine_id" element={<ProductDetails />} />
                                <Route path="/admin/clients" element={<UsersList />} />
                                <Route path="/admin/client/:userId" element={<UserDetail />} />
                                <Route path="/admin/stock" element={<Stock />} />
                                <Route path="/admin/offer" element={<Offer />} />
                                <Route path="/admin/order-product" element={<OrderProduct />} />
                                <Route path="/admin/request" element={<ProductRequestList />} />
                            </Route>
                        ) : (
                            <Route path="*" element={<Navigate to="/" />} />
                        )}

                        {/* Evara Smile Module Routes */}
                        <Route path="/evara-smile" element={<Login />} />
                        <Route path="/evara-smile-dashboard" element={<PrivateRoute element={EvaraSmileDashboard} />} />
                        <Route path="/evara-smile-employees" element={<PrivateRoute element={Employee} requiredRole="HR" />} />
                        <Route path="/evara-smile-employees/:empId" element={<PrivateRoute element={EmployeeProfile} requiredRole="HR" />} />
                        <Route path="/evara-smile-holiday" element={<PrivateRoute element={Holiday} />} />
                        <Route path="/evara-smile-policy" element={<PrivateRoute element={Policy} />} />
                        <Route path="/evara-smile-attendance" element={<PrivateRoute element={Attendance} />} />
                        <Route path="/evara-smile-notification" element={<PrivateRoute element={Notification} />} />
                        <Route path="/evara-smile-leave" element={<PrivateRoute element={Leave} />} />
                        <Route path="/evara-smile-expense" element={<PrivateRoute element={Expense} />} />
                        <Route path="/evara-smile-profile" element={<PrivateRoute element={EmpProfile} />} />
                        <Route path="/evara-smile-visit" element={<PrivateRoute element={Visit} />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
