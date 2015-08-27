var config = require('../util/config');

module.exports = {
    options: {
        port: '<%= config.serverPort %>',
        hostname: '<%= config.serverHostname %>'
    },
    proxies: [
        {
            context: '/api/identity',
            host: 'identity.api.rackspacecloud.com',
            port: 443,
            https: true,
            xforward: true,
            changeOrigin: false,
            rewrite: {
                '/api/identity': '/v2.0/'
            }
        }
    ],
    dist: {
        options: {
            middleware: function (cnct) {
                return [
                    function (req, res, next) {
                        if (req.url.indexOf('/encore/feedback') === 0) {
                            var response = JSON.stringify({ base: 'https://angularjs.org/' });
                            res.setHeader('Content-Type', 'application/json');
                            res.setHeader('Content-Length', response.length);
                            res.statusCode = 200;
                            res.end(response);
                            return false;
                        }
                        return next();
                    },
                    config.proxyRequest,
                    config.modRewrite([
                        'login.html /login.html [L]',
                        '^/login#* /login.html',
                        '^/index.html\/.* /index.html [L]',
                        '!\\.[0-9a-zA-Z_-]+$ /index.html [L]'
                    ]),
                    config.liveReloadPage,
                    config.mountFolder(cnct, '.tmp'),
                    config.mountFolder(cnct, config.docs)
                ];
            },
            livereload: 1337
        }
    },
    keepalive: {
        options: {
            keepalive: true,
            middleware: function (cnct) {
                return [
                    function (req, res, next) {
                        if (req.url.indexOf('/encore/feedback') === 0) {
                            var response = JSON.stringify({ base: 'https://angularjs.org/' });
                            res.setHeader('Content-Type', 'application/json');
                            res.setHeader('Content-Length', response.length);
                            res.statusCode = 200;
                            res.end(response);
                            return false;
                        }
                        return next();
                    },
                    config.mountFolder(cnct, config.docs)
                ];
            }
        }
    }
};
