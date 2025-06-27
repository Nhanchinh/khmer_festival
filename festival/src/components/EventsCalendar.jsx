import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './EventsCalendar.css';

const EventsCalendar = ({ articles }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Thêm debug log ở đầu component
    console.log('🔍 EventsCalendar received articles:', articles);

    // Parse ngày từ description
    const parseEventDates = (article) => {
        const datePattern = /Ngày:\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})/;
        const singleDatePattern = /Ngày:\s*(\d{1,2}\/\d{1,2}\/\d{4})/;

        const description = article.excerpt || article.description || '';
        console.log('🔍 Parsing description:', description);

        const dateMatch = description.match(datePattern);
        if (dateMatch) {
            console.log('✅ Found date range:', dateMatch[1], '-', dateMatch[2]);
            return {
                startDate: dateMatch[1],
                endDate: dateMatch[2],
                hasDate: true
            };
        }

        const singleMatch = description.match(singleDatePattern);
        if (singleMatch) {
            console.log('✅ Found single date:', singleMatch[1]);
            return {
                startDate: singleMatch[1],
                endDate: singleMatch[1],
                hasDate: true
            };
        }

        console.log('❌ No date found in:', description);
        return { hasDate: false };
    };

    // Lấy events cho tháng hiện tại
    const getEventsForMonth = (year, month) => {
        const eventsMap = new Map();

        articles.forEach(article => {
            const eventDates = parseEventDates(article);
            if (!eventDates.hasDate) return;

            try {
                const [startDay, startMonth, startYear] = eventDates.startDate.split('/');
                const [endDay, endMonth, endYear] = eventDates.endDate.split('/');

                // Kiểm tra nếu event nằm trong tháng hiện tại
                const startDate = new Date(startYear, startMonth - 1, startDay);
                const endDate = new Date(endYear, endMonth - 1, endDay);
                const monthStart = new Date(year, month, 1);
                const monthEnd = new Date(year, month + 1, 0);

                if (startDate <= monthEnd && endDate >= monthStart) {
                    // Tính các ngày event trong tháng
                    let currentEventDate = new Date(Math.max(startDate, monthStart));
                    const eventEndDate = new Date(Math.min(endDate, monthEnd));

                    while (currentEventDate <= eventEndDate) {
                        const day = currentEventDate.getDate();
                        if (!eventsMap.has(day)) {
                            eventsMap.set(day, []);
                        }
                        eventsMap.get(day).push(article);
                        currentEventDate.setDate(currentEventDate.getDate() + 1);
                    }
                }
            } catch (error) {
                console.error('Error parsing date:', error);
            }
        });

        return eventsMap;
    };

    // Tạo calendar grid
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay()); // Bắt đầu từ Chủ nhật

        const days = [];
        const eventsMap = getEventsForMonth(year, month);

        for (let i = 0; i < 42; i++) { // 6 tuần x 7 ngày
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);

            const isCurrentMonth = currentDay.getMonth() === month;
            const dayNumber = currentDay.getDate();
            const hasEvents = isCurrentMonth && eventsMap.has(dayNumber);
            const events = hasEvents ? eventsMap.get(dayNumber) : [];

            days.push({
                date: currentDay,
                dayNumber,
                isCurrentMonth,
                hasEvents,
                events
            });
        }

        return days;
    };

    const changeMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
        setSelectedEvent(null);
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const calendarDays = generateCalendarDays();

    // ✅ CẬP NHẬT: Lấy gợi ý trong khoảng 6 tháng
    const getUpcomingSuggestions = () => {
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        const sixMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

        const suggestions = articles
            .map(article => {
                const eventDates = parseEventDates(article);
                if (!eventDates.hasDate) return null;

                try {
                    const [day, month, year] = eventDates.startDate.split('/');
                    const eventDate = new Date(year, month - 1, day);

                    // Chỉ lấy events trong khoảng 6 tháng
                    if (eventDate >= sixMonthsAgo && eventDate <= sixMonthsLater) {
                        const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

                        return {
                            ...article,
                            eventDate,
                            eventStartDate: eventDates.startDate,
                            eventEndDate: eventDates.endDate,
                            daysUntil: diffDays,
                            absDays: Math.abs(diffDays)
                        };
                    }
                } catch (error) {
                    console.error('Error parsing date:', error);
                }
                return null;
            })
            .filter(event => event !== null)
            .sort((a, b) => a.absDays - b.absDays) // Sort theo khoảng cách gần nhất
            .slice(0, 5); // Top 5 gần nhất

        return suggestions;
    };

    const upcomingSuggestions = getUpcomingSuggestions();

    return (
        <div className="events-calendar">
            <div className="calendar-container">
                <div className="calendar-section">
                    <div className="calendar-header">
                        <button
                            className="calendar-nav-btn"
                            onClick={() => changeMonth(-1)}
                        >
                            ‹
                        </button>
                        <h2 className="calendar-title">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button
                            className="calendar-nav-btn"
                            onClick={() => changeMonth(1)}
                        >
                            ›
                        </button>
                    </div>

                    <div className="calendar-weekdays">
                        {weekDays.map(day => (
                            <div key={day} className="calendar-weekday">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="calendar-grid">
                        {calendarDays.map((day, index) => (
                            <div
                                key={index}
                                className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'
                                    } ${day.hasEvents ? 'has-events' : ''}`}
                                onClick={() => day.hasEvents && setSelectedEvent(day.events[0])}
                            >
                                <span className="calendar-day-number">
                                    {day.dayNumber}
                                </span>
                                {day.hasEvents && (
                                    <div className="calendar-event-indicator">
                                        {day.events.length > 1 ? (
                                            <span className="event-count">{day.events.length}</span>
                                        ) : (
                                            <span className="event-dot"></span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ✅ THÊM: Suggestions Section */}
                    {upcomingSuggestions.length > 0 && (
                        <div className="calendar-suggestions">
                            <div className="calendar-suggestions-title">
                                💡 Lễ hội gần ngày hiện tại
                            </div>
                            {upcomingSuggestions.map(event => (
                                <Link
                                    to={`/article/${event.id}`}
                                    key={event.id}
                                    className="calendar-suggestion-item"
                                >
                                    <div className="calendar-suggestion-info">
                                        <h5>{event.title}</h5>
                                        <p>🗺️ {event.location} • {event.eventStartDate}
                                            {event.eventStartDate !== event.eventEndDate && ` - ${event.eventEndDate}`}
                                        </p>
                                    </div>
                                    <div className="calendar-suggestion-countdown">
                                        <span className="calendar-countdown-days">
                                            {event.daysUntil >= 0 ? event.daysUntil : `+${Math.abs(event.daysUntil)}`}
                                        </span>
                                        <span className="calendar-countdown-label">
                                            {event.daysUntil >= 0 ? 'ngày nữa' : 'ngày trước'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="calendar-details">
                    <div className="calendar-illustration">
                        <img
                            src="/calendar-illustration.png"
                            alt="Calendar"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div className="calendar-placeholder" style={{ display: 'none' }}>
                            📅
                        </div>
                    </div>

                    <h3 className="calendar-details-title">Thông tin chi tiết</h3>

                    {selectedEvent ? (
                        <div className="selected-event">
                            <h4 className="selected-event-title">{selectedEvent.title}</h4>
                            <div className="selected-event-info">
                                <div className="selected-event-dates">
                                    {parseEventDates(selectedEvent).startDate}
                                    {parseEventDates(selectedEvent).startDate !== parseEventDates(selectedEvent).endDate &&
                                        ` - ${parseEventDates(selectedEvent).endDate}`
                                    }
                                </div>
                                <div className="selected-event-location">
                                    🗺️ {selectedEvent.location}
                                </div>
                            </div>
                            <p className="selected-event-excerpt">{selectedEvent.excerpt}</p>
                            <Link
                                to={`/article/${selectedEvent.id}`}
                                className="selected-event-link"
                            >
                                Xem chi tiết →
                            </Link>
                        </div>
                    ) : (
                        <div className="calendar-prompt">
                            <p>Đang nhập để xem thời khoá biểu của bạn</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventsCalendar; 