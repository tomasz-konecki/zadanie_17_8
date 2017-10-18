const bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    csurf = require('csurf'),
    express = require('express'),
    extend = require('xtend'),
    forms = require('forms'),
    router = express.Router(),

    profileForm = forms.create({
        givenName: forms.fields.string({ required: true }),
        surname: forms.fields.string({ required: true }),
        streetAddress: forms.fields.string(),
        city: forms.fields.string(),
        state: forms.fields.string(),
        zip: forms.fields.string()
    });

function renderForm(req, res, locals) {
    res.render('profile', extend({
        title: 'My Profile',
        csrfToken: req.csrfToken(),
        givenName: req.user.givenName,
        surname: req.user.surname,
        streetAddress: req.user.customData.streetAddress,
        city: req.user.customData.city,
        state: req.user.customData.state,
        zip: req.user.customData.zip
    }, locals || {}));
}

module.exports = function profile() {
    const router = express.Router();
    router.use(cookieParser());
    router.use(bodyParser.urlencoded({ extended: true }));
    router.use(csurf({ cookie: true }));
    return router;
};

router.all('/', (req, res) => {
    profileForm.handle(req, {
        success: (form) => {
            req.user.givenName = form.data.givenName;
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