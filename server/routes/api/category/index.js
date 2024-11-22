const { paths } = require('../../../../utils');
const { categoryController } = require("../../../controllers");

module.exports = (router) => {
    router.get(paths.api.APP_CATEGORIES, categoryController.getCategories);
};
