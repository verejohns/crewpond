const { constant } = require('../../utils');

module.exports = {
    renderLandingPage: function (req, res, params = {}) {
        res.render('landing_page', {
            title: params.title || constant.DEFAULT_TITLE
        });
    },

    renderTermsPage: function (req, res, params = {}) {
        res.render('terms', {
            title: params.title || constant.DEFAULT_TITLE
        });
    },

    renderPrivacyPage: function (req, res, params = {}) {
        res.render('privacy', {
            title: params.title || constant.DEFAULT_TITLE
        });
    },

    renderPricingPage: function (req, res, params = {}) {
        res.render('pricing', {
            title: params.title || constant.DEFAULT_TITLE
        });
    },

    renderFAQPage: function (req, res, params = {}) {
        res.render('faq', {
            title: params.title || constant.DEFAULT_TITLE
        });
    },

    renderRedirectPage: function (req, res, params = {}) {
        res.render('redirect', {
            title: params.title || constant.DEFAULT_TITLE
        });
    },

    renderApp: function (req, res, params = {}) {
        res.render('app', {
            title: params.title || constant.DEFAULT_TITLE
        });
    },

    renderAdmin: function (req, res, params = {}) {
        res.render('admin', {
            title: params.title || constant.DEFAULT_TITLE
        });
    }
};
