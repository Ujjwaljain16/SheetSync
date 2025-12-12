const axios = require('axios');

const API_URL = 'http://localhost:3000/sheetsync/batch';

const payload = {
    source: 'test-script',
    sync_id: new Date().toISOString(),
    rows: [
        {
            full_name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            joined_at: '2023-01-01',
            status: 'ACTIVE',
            performance_score: 85
        },
        {
            full_name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '987-654-3210',
            joined_at: '2023-02-15',
            status: 'INACTIVE',
            performance_score: 92
        },
        {
            full_name: 'Invalid User',
            email: '', // Missing email to trigger validation error
            phone: '000-000-0000',
            joined_at: '2023-03-01',
            status: 'ACTIVE'
        }
    ]
};

async function runTest() {
    try {
        console.log('Sending payload to', API_URL);
        const response = await axios.post(API_URL, payload);
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.error('Error Response:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

runTest();
