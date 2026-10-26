const express = require('express');

const app = express();
const PORT = 3000;

// Handle the home route
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Handle the pizza route
app.get('/pizza', (req, res) => {
    res.send('This is your pizza');
});

// Handle the home page
app.get('/home', (req, res) => {
    res.send('Welcome home');
});

// Handle the about page
app.get('/about', (req, res) => {
    res.send('Welcome to About Us');
});

// Handle the node page
app.get('/node', (req, res) => {
    res.send('Welcome to my Node Js project');
});

// Handle all other routes
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});