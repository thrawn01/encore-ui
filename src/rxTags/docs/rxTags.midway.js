var rxTagsPage = encore.rxTags;

describe('rxTags', function () {

    before(function () {
        demoPage.go('#/component/rxTags');
    });

    describe('exercises', encore.exercise.rxTags({
        sampleText: 'orange'
    }));

});
