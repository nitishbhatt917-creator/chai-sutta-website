class WorldClock {
    constructor() {
        this.clocks = [];
        this.init();
    }

    init() {
        const addBtn = document.getElementById('add-btn');
        const timezoneInput = document.getElementById('timezone-input');

        addBtn.addEventListener('click', () => this.addClock());
        timezoneInput.addEventListener('change', (e) => {
            if (e.target.value) {
                this.addClock();
                e.target.value = '';
            }
        });

        // Add default clocks for major cities
        this.addClock('Asia/Kolkata');
        this.addClock('Europe/London');
        this.addClock('America/New_York');
        this.addClock('Australia/Sydney');
    }

    addClock(timezone = null) {
        if (!timezone) {
            const select = document.getElementById('timezone-input');
            timezone = select.value;
        }

        if (!timezone) {
            alert('Please select a timezone');
            return;
        }

        // Check if clock already exists
        if (this.clocks.some(clock => clock.timezone === timezone)) {
            alert('This timezone is already displayed');
            return;
        }

        const clockId = 'clock-' + Date.now();
        this.clocks.push({
            id: clockId,
            timezone: timezone
        });

        this.createClockElement(clockId, timezone);
        this.updateClock(clockId, timezone);

        // Update clock every second
        setInterval(() => this.updateClock(clockId, timezone), 1000);
    }

    removeClock(clockId) {
        this.clocks = this.clocks.filter(clock => clock.id !== clockId);
        const element = document.getElementById(clockId);
        if (element) {
            element.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => element.remove(), 300);
        }
    }

    createClockElement(clockId, timezone) {
        const container = document.getElementById('clocks-container');
        const clockCard = document.createElement('div');
        clockCard.id = clockId;
        clockCard.className = 'clock-card';

        const timezoneName = timezone.replace(/_/g, ' ');
        const abbreviation = this.getTimezoneAbbreviation(timezone);

        clockCard.innerHTML = `
            <div class="timezone-name">${timezoneName}</div>
            <div class="timezone-offset" id="${clockId}-offset">UTC</div>
            <div class="clock-display" id="${clockId}-time">--:--:--</div>
            <div class="date-display" id="${clockId}-date">Loading...</div>
            <div class="day-display" id="${clockId}-day">Loading...</div>
            <button class="remove-btn" onclick="worldClock.removeClock('${clockId}')">Remove</button>
        `;

        container.appendChild(clockCard);
    }

    updateClock(clockId, timezone) {
        try {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            const dateFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const timeString = formatter.format(now);
            const dateString = dateFormatter.format(now);
            const dayString = dateString.split(',')[0];

            // Get UTC offset
            const offset = this.getUtcOffset(timezone, now);

            // Update elements
            const timeElement = document.getElementById(`${clockId}-time`);
            const dateElement = document.getElementById(`${clockId}-date`);
            const dayElement = document.getElementById(`${clockId}-day`);
            const offsetElement = document.getElementById(`${clockId}-offset`);

            if (timeElement) timeElement.textContent = timeString;
            if (dateElement) dateElement.textContent = dateString;
            if (dayElement) dayElement.textContent = dayString;
            if (offsetElement) offsetElement.textContent = offset;

        } catch (error) {
            console.error(`Error updating clock for ${timezone}:`, error);
        }
    }

    getUtcOffset(timezone, date = new Date()) {
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            const parts = formatter.formatToParts(date);
            const tzDate = new Date(
                `${parts[4].value}-${parts[0].value}-${parts[2].value}T${parts[6].value}:${parts[8].value}:${parts[10].value}Z`
            );

            const offset = date.getTime() - tzDate.getTime();
            const hours = Math.floor(Math.abs(offset) / 3600000);
            const minutes = Math.floor((Math.abs(offset) % 3600000) / 60000);

            const sign = offset > 0 ? '+' : '-';
            const paddedHours = String(hours).padStart(2, '0');
            const paddedMinutes = String(minutes).padStart(2, '0');

            return `UTC ${sign}${paddedHours}:${paddedMinutes}`;
        } catch (error) {
            return 'UTC';
        }
    }

    getTimezoneAbbreviation(timezone) {
        const abbreviations = {
            'Asia/Kolkata': 'IST',
            'Asia/Bangkok': 'ICT',
            'Asia/Tokyo': 'JST',
            'Asia/Dubai': 'GST',
            'Asia/Singapore': 'SGT',
            'Asia/Hong_Kong': 'HKT',
            'Asia/Shanghai': 'CST',
            'Europe/London': 'GMT',
            'Europe/Paris': 'CET',
            'Europe/Berlin': 'CET',
            'Europe/Moscow': 'MSK',
            'America/New_York': 'EST',
            'America/Chicago': 'CST',
            'America/Denver': 'MST',
            'America/Los_Angeles': 'PST',
            'America/Toronto': 'EST',
            'Australia/Sydney': 'AEDT',
            'Australia/Melbourne': 'AEDT',
            'Australia/Perth': 'AWST',
            'Africa/Cairo': 'EET',
            'Africa/Johannesburg': 'SAST',
            'Africa/Lagos': 'WAT'
        };

        return abbreviations[timezone] || 'UTC';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.worldClock = new WorldClock();
});

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.9);
        }
    }
`;
document.head.appendChild(style);
