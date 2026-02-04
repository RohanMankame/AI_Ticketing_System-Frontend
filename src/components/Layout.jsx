import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <TopNav />
                <main className="flex-1 mt-16 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
