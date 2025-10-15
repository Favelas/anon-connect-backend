// __tests__/authService.test.js
const { registerUser, loginUser } = require('../services/authService');
const User = require('../models/User'); 
const bcrypt = require('bcrypt'); // Need to mock bcrypt too, since it's used in authService

// --- MOCKING EXTERNAL DEPENDENCIES ---
// 1. Mock the User Model (to avoid DB calls)
jest.mock('../models/User', () => ({
    // findOne will be configured per test
    findOne: jest.fn(),
    // create will return a mocked user object 
    create: jest.fn(data => ({ id: 101, ...data })), 
}));

// 2. Mock bcrypt (to control password comparisons)
jest.mock('bcrypt', () => ({
    // hash needs to return a fake hashed password
    hash: jest.fn(() => 'hashed_password_fake'),
    // compare needs to return true/false based on the test
    compare: jest.fn(), 
}));
// --- END MOCKING ---


describe('authService Tests', () => {

    beforeEach(() => {
        // Clear mocks before each test to ensure isolation
        User.findOne.mockClear(); 
        User.create.mockClear();
        bcrypt.hash.mockClear();
        bcrypt.compare.mockClear();
    });

    // --- TEST 1: Registration Failure (Already Exists) ---
    test('1. Registration must fail if the user already exists (Error 409)', async () => {
        // Mock findOne to RETURN a user (user exists)
        User.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });

        await expect(
            registerUser('test@example.com', 'password123')
        ).rejects.toMatchObject({ 
            message: 'El usuario con este correo ya existe.',
            status: 409,
        });

        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.create).not.toHaveBeenCalled(); 
    });

    // --- TEST 2: Registration Success ---
    test('2. Registration must succeed and return a token for a new user', async () => {
        // Mock findOne to return NULL (user does not exist)
        User.findOne.mockResolvedValue(null);
        // Mock bcrypt to return a fake hash
        bcrypt.hash.mockResolvedValue('newly_hashed_password');

        // Execute the function
        const result = await registerUser('new@user.com', 'securepass');
        
        // Assertions
        expect(result).toHaveProperty('token');
        expect(typeof result.token).toBe('string');
        
        // Verify flow: User was searched, password was hashed, and user was created
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(bcrypt.hash).toHaveBeenCalledTimes(1);
        expect(User.create).toHaveBeenCalledWith({
            email: 'new@user.com',
            password: 'newly_hashed_password', // Check that the hashed password was passed
        });
    });

    // --- TEST 3: Login Failure (Invalid Credentials) ---
    test('3. Login must fail with Error 401 for invalid credentials', async () => {
        // Mock findOne to return a user (user exists)
        User.findOne.mockResolvedValue({ id: 1, email: 'user@test.com', password: 'hashed_password' });
        // Mock bcrypt.compare to return FALSE (password is wrong)
        bcrypt.compare.mockResolvedValue(false);

        // Execute and expect rejection
        await expect(
            loginUser('user@test.com', 'wrongpassword')
        ).rejects.toMatchObject({ 
            message: 'Credenciales inválidas.',
            status: 401,
        });

        // Verify flow: User was searched, and compare was attempted
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });

    // --- TEST 4: Login Success ---
    test('4. Login must succeed and return a token for valid credentials', async () => {
        // Mock findOne to return a user (user exists)
        User.findOne.mockResolvedValue({ id: 1, email: 'valid@user.com', password: 'hashed_password' });
        // Mock bcrypt.compare to return TRUE (password is correct)
        bcrypt.compare.mockResolvedValue(true);

        // Execute the function
        const result = await loginUser('valid@user.com', 'correctpassword');

        // Assertions
        expect(result).toHaveProperty('token');
        expect(typeof result.token).toBe('string');

        // Verify flow: User was searched, and compare was successful
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });

});