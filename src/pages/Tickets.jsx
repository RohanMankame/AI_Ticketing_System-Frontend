import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { getTickets } from '../services/api';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';


ModuleRegistry.registerModules([AllCommunityModule]);


import 'ag-grid-community/styles/ag-theme-quartz.css';


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
    const [loading, setLoading] = useState(true);


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

    const onRowDoubleClicked = (params) => {
        navigate(`/tickets/${params.data.issue_key}`, { state: { ticket: params.data } });
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Tickets</h2>
            <div className={myTheme.className} style={{ height: '600px', minHeight: '500px' }}>
                <AgGridReact
                    rowData={tickets}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                    animateRows={true}
                    rowSelection={{ type: 'multiple' }}
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
