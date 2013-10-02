"use strict";

module.exports = function (server, db, sessCrypto, async, request, qs, jsdom, foreach) {

server.get('menu', function (req, res, next) {
    var token = sessCrypto.decrypt(req.params.session);
    if (token === null || !(token.id)) {
        res.send(401, 'Session not found');
        return next();
    }

    async.waterfall([
        function (next) {
            db.Session.find(token.id).success(function (session) {
                if (session == null) {
                    next(401);
                } else {
                    next(null, session);
                }
            });
        }, function (session, next) {
            var url = "https://solss.uow.edu.au/sid/sols_menu.display_sols_menu?" + qs.stringify({
                p_system: 'STUDENT',
                p_menu_name: 'MAIN_MENU',
                p_student_number: session.number,
                p_session_id: session.sid,
            });
            //console.log('menu:', url);
            request.get(url, function (error, resp, body) {
                next(error, body);
            });
        }, function (body, next) {
            body = body.replace(/href="\/sid/g, 'href="https://solss.uow.edu.au/sid');
            jsdom.env(body, [], function (errors, window) {
                next(null, window);
            });
        }, function (window, next) {
            var links = [], doc = window.document;
            foreach(doc.querySelectorAll('#navMenu > ul > li'), function (v, k) {
                var heading = v.querySelector("span").textContent;
                //console.log('found heading:', heading);
                var innerlinks = [];
                foreach(v.querySelectorAll('.navLinks a'), function (vv) {
                    //console.log('found link:', heading, vv.textContent);
                    innerlinks.push({
                        title: vv.textContent,
                        link: vv.href
                    });
                });
                links.push({
                    title: heading,
                    links: innerlinks
                });
            });
            window.close();
            next(null, links);
        }
    ], function (error, result) {
        if (result) {
            res.send(200, result);
        } else if (error === 401) {
            res.send(401, 'Session not found');
        } else {
            res.send(500, error);
        }

    })
    return next();
});

};
