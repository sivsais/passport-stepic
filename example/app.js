'use strict';

const PORT = 3000;

const passport = require('passport');
const StepicStrategy = require('../index');
const app = require('express')();
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

let strategy = new StepicStrategy({
    clientID: process.env.STEPIC_CLIENT_ID,
    clientSecret: process.env.STEPIC_CLIENT_SECRET,
    callbackURL: `http://localhost:${PORT}/login/callback`
}, (accessToken, refreshToken, profile, cb) => {
    console.log('accessToken: ', accessToken);
    console.log('refreshToken: ', refreshToken);
    console.log('profile: ', profile);
    cb(null, profile);
});

passport.use(strategy);

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', passport.authenticate('stepic'));
app.get('/login/callback', passport.authenticate('stepic', { successRedirect: '/profile' }));
app.get('/profile', ensureLoggedIn(), (req, res) => res.json(req.user));
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Listening ${PORT}...`));
