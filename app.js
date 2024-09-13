const express = require('express');
const app = express();
const mongoose = require('mongoose');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');

mongoose.connect('mongodb://127.0.0.1:27017/task').then(console.log('Mongodb connected successfully')).catch("connection failed");


// City routes
const City = require('./models/cityModel');

app.post('/city', async(req,res) => {
    const {city} = req.body;

    const regex = /^[A-Za-z]+$/;
    if(!regex.test(city)) {
        return res.status(300).json({code:300, msg: "city name contains numeric characters"});
    }

    try {
        const newCity = new City({name: city});
        await newCity.save();

        res.status(200).json({code:200, msg: "City name inserted"});
    } catch (error) {
        res.status(300).json({code: 300, msg: 'City name already exists or an error occurred'});
    }
})

app.get('/city', async(req,res) => {
    try {
        const cities = await City.find();
        res.status(200).json(cities);
    } catch (error) {
        res.status(500).json({msg: "Error fetching data"});
    }
});


// Third party API
const axios = require('axios');

app.get('/get-time', async(req,res) => {
    try {
        const response = await axios.get('https://api.binance.com/api/v1/time');
        console.log('Time:', response.data.serverTime);
        res.status(200).json(response.data);
        
    } catch (error) {
        res.status(500).json({msg: "Error fetching data"});
    }
})


// User Routes
const User = require('./models/userModel');

app.post('/user', async(req,res) => {
    const {name, city, mobile, media_url} = req.body;

    const nameRegex = /^[A-Za-z]+$/;
    const mobileRegex = /^[0-9]{10}$/;

    if(!nameRegex.test(name)) {
        return res.status(300).json({code:300, msg: "name contains numeric characters"});
    }

    if(!mobileRegex.test(mobile)) {
        return res.status(300).json({code:300, msg: "mobile number not valid"});
    }

    if(media_url && !media_url.startsWith('https://')) {
        return res.status(300).json({code:300, msg: "media_url should start with http://" });
    }

    try {

        const response = await axios.get('https://api.binance.com/api/v1/time');
        const serverTime = response.data.serverTime;

        const newUser = new User({
            name,
            city,
            mobile,
            media_url,
            uid : serverTime
        });

        await newUser.save();

        res.status(200).json({code:200, msg: "User created successfully", user: newUser});
    } catch (error) {
        res.status(500).json({code:300, msg: "Error occurred while creating user"});
    }
});

app.get('/users', async(req,res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({code:300, msg: "Error fetching user data"});
    }
});

app.get('/users-view', async(req,res) => {
    try {
        const users = await User.find();
        res.render('users', {users});
    } catch (error) {
        res.status(300).send("Error occurred while fetching data");
    }
});

app.post('/user-modify/:id', async(req,res) => {
    const userId = req.params.id;
    const {name, city, mobile, media_url} = req.body;

    const nameRegex = /^[A-Za-z]+$/;
    const mobileRegex = /^[0-9]{10}$/;
    const cityRegex = /^[A-Za-z]+$/;
    
    if(!nameRegex.test(name)) {
        return res.status(300).json({code:300, msg: "name contains numeric characters"});
    }

    if(!cityRegex.test(city)) {
        return res.status(300).json({code:300, msg: "city contains numeric characters"});
    }

    if(!mobileRegex.test(mobile)) {
        return res.status(300).json({code:300, msg: "mobile number not valid"});
    }

    if(media_url && !media_url.startsWith('https://')) {
        return res.status(300).json({code:300, msg: "media_url should start with http://" });
    }

    try {
        const updateUser = await User.findByIdAndUpdate({ _id: userId }, { name, city, mobile, media_url }, { new: true });

        if(!updateUser) {
            return res.status(404).send('User not found');
        }

        res.status(200).json({code:200, msg: "User updated successfully", user: updateUser});
    } catch (error) {
        res.status(500).json({msg: "Error updating user data", error: error.message});
    }
})

app.get('/user-modify/:id', async(req,res) => {
    const userId = req.params.id;

    try {
        const user = await User.findOne({_id : userId});

        if(!user) {
            return res.status(404).send('User not found');
        }

        res.render('editUser', {user});
    } catch (error) {
        res.status(500).send("Error occurred while loading user data")
    }
})

app.listen(3000, () => {
    console.log('Server listening on port 3000');
    
})