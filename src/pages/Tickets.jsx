import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { getTickets, importTickets } from '../services/api';
import { Upload, Search } from 'lucide-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';


ModuleRegistry.registerModules([AllCommunityModule]);


import 'ag-grid-community/styles/ag-theme-quartz.css';

// Custom theme configuration for AG Grid
const myTheme = themeQuartz
    .withParams({
        backgroundColor: "#1f2836",
        browserColorScheme: "dark",
        chromeBackgroundColor: {
            ref: "foregroundColor",
            mix: 0.07,
            onto: "backgroundColor"
        },
        foregroundColor: "#FFF",
        headerFontSize: 14
    });


const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);


    // Column definitions for AG Grid table
    const [colDefs] = useState([
        { field: 'issue_key', headerName: 'Issue Key', sortable: true, filter: true, width: 120 },
        { field: 'summary', headerName: 'Summary', sortable: true, filter: true, flex: 1 },
        { field: 'status', headerName: 'Status', sortable: true, filter: true, width: 120 },
        { field: 'priority', headerName: 'Priority', sortable: true, filter: true, width: 120 },
        { field: 'assignee', headerName: 'Assignee', sortable: true, filter: true, width: 150 },
        {
            field: 'due_date', headerName: 'Due Date', sortable: true, filter: true, width: 200,
            valueFormatter: params => new Date(params.value).toLocaleString()
        }
    ]);

    // Fetch tickets from backend API on component mount
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const data = await getTickets();
                setTickets(data);
            } catch (error) {
                console.error("Error fetching tickets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);


    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
    }), []);

    const navigate = useNavigate();

    // Handle double-click on a row to navigate to ticket details page
    const onRowDoubleClicked = (params) => {
        const ticketId = params.data.id;
        navigate(`/tickets/${ticketId}`);
    };

    const fileInputRef = useRef(null);

    // Handle file upload for importing tickets from CSV
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            await importTickets(file);
            // Refresh tickets after import
            const data = await getTickets();
            setTickets(data);
            alert('Tickets imported successfully!');
        } catch (error) {
            console.error("Failed to import tickets", error);
            alert('Failed to import tickets. Please check the console for details.');
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Tickets</h2>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".csv"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            disabled={loading}
                        >
                            <Upload size={16} className="transform rotate-180" />
                            {loading ? 'Importing...' : 'Import CSV'}
                        </button>
                    </div>
                </div>
            </div>
            {/* AG Grid table containing all tickets */}
            <div className={myTheme.className} style={{ height: '600px', minHeight: '500px' }}>
                <AgGridReact
                    rowData={tickets}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                    quickFilterText={searchTerm}
                    animateRows={true}
                    rowSelection={{ mode: 'multiRow' }}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[5, 10, 20, 50, 100]}
                    theme={myTheme}
                    onRowDoubleClicked={onRowDoubleClicked}
                />
            </div>
        </div>
    );
};

export default Tickets;
