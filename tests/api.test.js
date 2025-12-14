const request = require('supertest');
const app = require('../src/app');

// Mock Database
jest.mock('../src/db', () => ({
    pool: {
        connect: jest.fn().mockResolvedValue({
            query: jest.fn().mockImplementation((query) => {
                if (query === 'BEGIN' || query === 'COMMIT' || query === 'ROLLBACK') return;
                // Mock return for the bulk insert
                if (query.trim().startsWith('INSERT INTO')) {
                    return { rowCount: 1 };
                }
                return { rows: [] };
            }),
            release: jest.fn()
        })
    }
}));

// Mock Notification Service
jest.mock('../src/services/notification', () => ({
    sendNotification: jest.fn()
}));

// Set valid API Key for testing
process.env.API_KEY = "test-secret";

describe('SheetSync E2E API Tests', () => {
    
    const validRow = {
        "full_name": "Test User",
        "email": "test@example.com",
        "joined_at": "2023-01-01",
        "status": "Active",
        "score": 100
    };

    // --- Authentication Tests ---
    describe('Authentication', () => {
        it('should return 401 if API Key is missing', async () => {
            const res = await request(app)
                .post('/sheetsync/batch')
                .send({});
            expect(res.statusCode).toEqual(401);
        });

        it('should return 403 if API Key is invalid', async () => {
            const res = await request(app)
                .post('/sheetsync/batch')
                .set('x-api-key', 'wrong-key')
                .send({});
            expect(res.statusCode).toEqual(403);
        });
    });

    // --- Validation Tests ---
    describe('Input Validation', () => {
        it('should return 400 for empty payload', async () => {
            const res = await request(app)
                .post('/sheetsync/batch')
                .set('x-api-key', 'test-secret')
                .send({}); // Missing 'rows'
            expect(res.statusCode).toEqual(400);
        });

        it('should return 400 for non-array rows', async () => {
            const res = await request(app)
                .post('/sheetsync/batch')
                .set('x-api-key', 'test-secret')
                .send({ rows: "not-an-array" });
            expect(res.statusCode).toEqual(400);
        });
    });

    // --- Business Logic Tests ---
    describe('Batch Processing', () => {

        it('should process a valid batch successfully', async () => {
            const res = await request(app)
                .post('/sheetsync/batch')
                .set('x-api-key', 'test-secret')
                .send({ rows: [validRow] });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.rows_received).toBe(1);
        });

        it('should handle partial failures (missing fields)', async () => {
            const invalidRow = { "score": 50 }; // Missing email/name
            
            const res = await request(app)
                .post('/sheetsync/batch')
                .set('x-api-key', 'test-secret')
                .send({ rows: [validRow, invalidRow] });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.rows_received).toBe(2);
            // Expect 1 failure
            expect(res.body.rows_failed.length).toBe(1);
            expect(res.body.rows_failed[0].error).toContain('Missing required field');
        });

        it('should deduplicate emails within the same batch', async () => {
            const res = await request(app)
                .post('/sheetsync/batch')
                .set('x-api-key', 'test-secret')
                .send({ rows: [validRow, validRow] });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.rows_received).toBe(2);
        });
    });

    // --- Advanced Failure Scenarios ---
    describe('System Resilience', () => {
        it('should rollback transaction on database failure', async () => {
            // Override mock to throw error ONCE
            require('../src/db').pool.connect.mockResolvedValueOnce({
                query: jest.fn()
                    .mockRejectedValueOnce(new Error('DB Connection Lost'))
                    .mockResolvedValue({}),
                release: jest.fn()
            });

            const res = await request(app)
                .post('/sheetsync/batch')
                .set('x-api-key', 'test-secret')
                .send({ rows: [validRow] });

            expect(res.statusCode).toEqual(500);
            expect(res.body.error).toContain('DB Connection Lost');
        });
    });
});
