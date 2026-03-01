import { suggestServiceFromQuery } from './src/services/ai.service.js';
import dotenv from 'dotenv';
dotenv.config();

const services = [
    { id: '1', name: 'House Cleaning' },
    { id: '2', name: 'Plumbing' },
    { id: '3', name: 'Electrical Work' },
    { id: '4', name: 'AC Repair' }
];

const query = 'I need an AC technician in Lahore';

suggestServiceFromQuery(query, services, ['Karachi', 'Lahore'])
    .then(res => console.log('Result:', JSON.stringify(res, null, 2)))
    .catch(err => console.error('Error:', err));
