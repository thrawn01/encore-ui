var exercise = require('../rxPaginate.exercise.js');

describe('rxPaginate', function () {

    before(function () {
        demoPage.go('#/component/rxPaginate');
    });

    describe('UI pagination exercises', exercise.rxPaginate({
       pageSizes: [3, 50, 200, 350, 500],
       defaultPageSize: 3,
       cssSelector: '.demo-ui-pagination .rx-paginate'
    }));

    describe('API pagination exercises', exercise.rxPaginate({
        pageSizes: [25, 50, 200, 350, 500],
        defaultPageSize: 25,
        pages: 30,
        cssSelector: '.demo-api-pagination .rx-paginate'
    }));

});
