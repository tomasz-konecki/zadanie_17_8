const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const express = require('express');
const extend = require('xtend');
const forms = require('forms');

const profileForm = forms.create({
    firstName: forms.fields.string({ required: true }),
    surname: forms.fields.string({ required: true }),
    streetAddress: forms.fields.string(),
    city: forms.fields.string(),
    state: forms.fields.string(),
    zip: forms.fields.string()
});

const renderForm = (req, res, locals) => {
    res.render('profile', extend({
        title: 'My Profile',
        csrfToken: req.csrfToken(),
        firstName: req.user.firstName,
        surname: req.user.surname,
        streetAddress: req.user.customData.streetAddress,
        city: req.user.customData.city,
        state: req.user.customData.state,
        zip: req.user.customData.zip
    },
        locals || {}));
}

module.exports = function profile() {
    const router = express.Router();
        router.use(cookieParser());
        router.use(bodyParser.urlencoded({ extended: true }));
        router.use(csurf({ cookie: true }));

    router.all('/', (req, res) => {
        profileForm.handle(req, {
            success: (form) => {
                req.user.firstName = form.data.firstName;
                req.user.surname = form.data.surname;
                req.user.customData.streetAddress = form.data.streetAddress;
                req.user.customData.city = form.data.city;
                req.user.customData.state = form.data.state;
                req.user.customData.zip = form.data.zip;
                req.user.customData.save();
                req.user.save((err) => {
                    if (err) {
                        if (err.developerMessage){
                            console.error(err);
                        }
                        renderForm(req, res, {
                            errors: [{
                                error: err.userMessage ||
                                err.message || String(err)
                            }]
                        });
                    } else {
                        renderForm(req, res, {
                            saved: true
                        });
                    }
                });
            },
            empty: () => {
                renderForm(req, res);
            }
        });
    });

    return router;
};