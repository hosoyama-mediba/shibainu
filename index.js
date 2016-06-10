'use strict';

const Nightmare = require('nightmare');
const argv = require('minimist')(process.argv.slice(2));
const imagemin = require('imagemin');

const URL = argv.u || 'https://ja.wikipedia.org/wiki/%E6%9F%B4%E7%8A%AC';
const DIR = argv.o || './';
const FILE = argv.f || 'shibainu.png';
const UA = argv.a || 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

Nightmare.action('scrolloff', function(done) {
    this.evaluate_now(function() {
        return document.body.style.overflow = 'hidden';
    }, done);
});

Nightmare.action('height', function(done) {
    this.evaluate_now(function() {
        return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    }, done);
});

const nightmare = new Nightmare({
    width: 320,
    height: 568,
    show: false,
    switches: {
        'ignore-certificate-errors': true,
    },
});

function connect() {
    return Promise.resolve(
        nightmare
            .useragent(UA)
            .goto(URL)
            .scrolloff()
    );
}

function height() {
    return Promise.resolve(
        nightmare
            .wait(3000)
            .height()
    );
}

function screenshot(height) {
    return Promise.resolve(
        nightmare
            .viewport(320, height)
            .screenshot(DIR + FILE)
    );
}

function end() {
    return Promise.resolve(
        nightmare.end()
    );
}

function image() {
    return imagemin([DIR + FILE], DIR, {
        plugins: [
            require('imagemin-pngquant')({ quality: '50' })
        ]
    });
}

connect()
    .then(height)
    .then(screenshot)
    .then(end)
    .then(image)
    .catch(end);
