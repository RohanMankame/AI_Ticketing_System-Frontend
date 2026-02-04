import { useState, useEffect } from 'react';
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

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const data = await getTickets();
                setTickets(data);

               
                const ticketEvents = data.map(ticket => {
                    const date = ticket.due_date ? new Date(ticket.due_date) : new Date(ticket.created_at);
                    return {
                        id: ticket.id || ticket.issue_key,
                        title: ticket.summary,
                        start: date,
                        end: date,
                        allDay: true,
                        resource: ticket
                    };
                });
                setEvents(ticketEvents);
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
        updateSelectedTickets(event.start, tickets);
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow "> 
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
                className="text-gray-800 dark:text-gray-200"
                toolbar={false}                 
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
                            <div key={ticket.issue_key} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
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
