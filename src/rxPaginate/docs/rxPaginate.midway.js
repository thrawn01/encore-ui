var exercise = require('../rxPaginate.exercise.js');

describe('rxPaginate', function () {

    before(function () {
        demoPage.go('#/component/rxPaginate');
    });

    describe('exercises', exercise.rxPaginate({
        pageSizes: [3, 50, 200, 350, 500],
        defaultPageSize: 3,
        cssSelector: '.demo-ui-pagination .rx-paginate'
    }));

});
