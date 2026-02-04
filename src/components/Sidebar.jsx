import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, Calendar, Book, BarChart2 } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Tickets', path: '/tickets', icon: <Ticket size={20} /> },
        { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
        { name: 'Knowledge', path: '/knowledge', icon: <Book size={20} /> },
        { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
    ];

    return (
        <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col fixed left-0 top-0 border-r border-gray-800">
            <div className="p-6 ">
                <h2 className="text-xl font-bold tracking-wider">AI TICKETING SYSTEM</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            
        </aside>
    );
};

export default Sidebar;
