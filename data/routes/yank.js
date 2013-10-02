"use strict";
module.exports = function (server, db, sessCrypto, qs, request) {

server.get('yank', function (req, res, next) {
    var token = sessCrypto.decrypt(req.params.session);
    if (token === null || !(token.id)) {
        res.send(401, 'Session not found');
        return next();
    }

    db.Session.find(token.id).success(function (session) {

        if (session == null) {
            res.send(401, 'Session not found');
            return;
        }

        var details = {
            P_STUDENT_NUMBER: session.number,
            P_SESSION_ID: session.sid,
            p_cs: session.cs
        };

        if (req.params.authLower) {
            details = {
                p_student_number: session.number,
                p_session_id: session.sid,
            };
        }

        var url = "https://solss.uow.edu.au/sid/" + req.params.page + "?" + ( req.params.extra ? req.params.extra + '&' : '') + 
            qs.stringify(details);

        if (req.params.redirect) {
            res.header('Location', url);
            res.send(303, 'Here is that page.');
            return;
        }
        console.log('url: ', url, JSON.stringify(params));
        request.get(url, function (error, resp, body) {
            if (error) {
                res.send(500, error);
            } else if (((resp.statusCode / 100) | 0) === 3) {// 3xx
                res.send(302, { location: resp.headers.location });
            } else if (/Your session has timed out/g.test(body) || /Parameter Mismatch/g.test(body)) {
                res.send(401, 'Session not found');
            } else {
                body = body.replace(/href="\/sid/g, 'href="https://solss.uow.edu.au/sid');
                res.send(resp.statusCode, body);
            }
        });

    }).error(function (err) {
        res.send(404, 'Session not found');
    });
    return next();
});

}