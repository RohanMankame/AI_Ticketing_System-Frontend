import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { getTickets } from '../services/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '/styles/CalendarPage.css';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('month');
    const routerNavigate = useNavigate();

    const navigate = (action) => {
        let newDate = new Date(date);
        if (action === 'TODAY') {
            newDate = new Date();
        } else if (action === 'PREV') {
            if (view === 'month') newDate = moment(date).subtract(1, 'month').toDate();
            else if (view === 'week') newDate = moment(date).subtract(1, 'week').toDate();
            else newDate = moment(date).subtract(1, 'day').toDate();
        } else if (action === 'NEXT') {
            if (view === 'month') newDate = moment(date).add(1, 'month').toDate();
            else if (view === 'week') newDate = moment(date).add(1, 'week').toDate();
            else newDate = moment(date).add(1, 'day').toDate();
        }
        setDate(newDate);
    };

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const data = await getTickets();
                setTickets(data);

                // Group tickets by date
                const ticketsByDate = {};
                data.forEach(ticket => {
                    const ticketDate = ticket.due_date ? new Date(ticket.due_date) : new Date(ticket.created_at);
                    const dateStr = moment(ticketDate).format('YYYY-MM-DD');

                    if (!ticketsByDate[dateStr]) {
                        ticketsByDate[dateStr] = {
                            date: ticketDate,
                            tickets: [],
                            open: 0,
                            closed: 0
                        };
                    }
                    ticketsByDate[dateStr].tickets.push(ticket);
                    if (ticket.status === 'Done') {
                        ticketsByDate[dateStr].closed++;
                    } else {
                        ticketsByDate[dateStr].open++;
                    }
                });

                const aggregatedEvents = [];
                Object.values(ticketsByDate).forEach(group => {
                    // Push Open tickets event first so it stays on top (usually)
                    if (group.open > 0) {
                        aggregatedEvents.push({
                            id: `${moment(group.date).format('YYYY-MM-DD')}-open`,
                            title: `${group.open} Open`,
                            start: group.date,
                            end: group.date,
                            allDay: true,
                            resource: {
                                tickets: group.tickets.filter(t => t.status !== 'Done'),
                                type: 'open'
                            }
                        });
                    }
                    // Push Closed tickets event second
                    if (group.closed > 0) {
                        aggregatedEvents.push({
                            id: `${moment(group.date).format('YYYY-MM-DD')}-closed`,
                            title: `${group.closed} Closed`,
                            start: group.date,
                            end: group.date,
                            allDay: true,
                            resource: {
                                tickets: group.tickets.filter(t => t.status === 'Done'),
                                type: 'closed'
                            }
                        });
                    }
                });

                setEvents(aggregatedEvents);
                updateSelectedTickets(new Date(), data);
            } catch (error) {
                console.error("Error fetching tickets for calendar:", error);
            }
        };

        fetchTickets();
    }, []);

    const updateSelectedTickets = (date, allTickets) => {
        const dateStr = moment(date).format('YYYY-MM-DD');
        const filtered = allTickets.filter(t => {
            const tDate = t.due_date ? new Date(t.due_date) : new Date(t.created_at);
            return moment(tDate).format('YYYY-MM-DD') === dateStr;
        });
        setSelectedTickets(filtered);
    };

    const handleSelectSlot = (slotInfo) => {
        setSelectedDate(slotInfo.start);
        updateSelectedTickets(slotInfo.start, tickets);
    };

    const handleSelectEvent = (event) => {
        setSelectedDate(event.start);
        // Use tickets from the aggregated event resource
        setSelectedTickets(event.resource.tickets);
    };

    const handleTicketClick = (ticket) => {
        const ticketId = ticket.id || ticket.issue_id || ticket.issue_key;
        routerNavigate(`/tickets/${ticketId}`);
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                <div className="flex items-center justify-between mb-3">

                    <div className="text-m font-medium ">{moment(date).format(view === 'month' ? 'MMMM YYYY' : 'MMM D, YYYY')}</div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded" onClick={() => navigate('PREV')}> ← </button>
                        <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded" onClick={() => navigate('TODAY')}>Current</button>
                        <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded" onClick={() => navigate('NEXT')}> → </button>
                    </div>
                </div>

                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable
                    views={['month', 'week', 'day']}
                    defaultView="month"
                    view={view}
                    onView={(v) => setView(v)}
                    date={date}
                    onNavigate={(d) => setDate(d)}
                    className="text-gray-800 dark:text-gray-200"
                    toolbar={false}
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: event.resource.type === 'open' ? '#3b82f6' : '#10b981', // Blue for Open, Green for Closed
                            fontSize: '0.85em',
                            marginBottom: '2px'
                        }
                    })}
                />
            </div>

            <div className="w-full md:w-80 bg-white dark:bg-gray-800 p-6 rounded-lg shadow overflow-y-auto ">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                    {moment(selectedDate).format('MMMM Do, YYYY')}
                </h3>

                {selectedTickets.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No tickets due on this day.</p>
                ) : (
                    <div className="space-y-4">
                        {selectedTickets.map(ticket => (
                            <div
                                key={ticket.issue_key}
                                onClick={() => handleTicketClick(ticket)}
                                className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all cursor-pointer hover:border-blue-400"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{ticket.issue_key}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.priority === 'High' ? 'bg-red-300 text-red-900' :
                                        ticket.priority === 'Medium' ? 'bg-yellow-300 text-yellow-900' :
                                            'bg-green-300 text-green-900'
                                        }`}>
                                        {ticket.priority || 'Normal'}
                                    </span>
                                </div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate">{ticket.summary}</h4>
                                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                    <span>{ticket.status}</span>
                                    <span>{ticket.assignee || 'Unassigned'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarPage;
