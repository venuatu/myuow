"use strict";
var INVALID_SESSION_STRINGS = [
    'Your session has timed out.',
    'You are not currently logged on to the SOLS system',
    'Parameter Mismatch'
];
module.exports = function (server, db, sessCrypto, request, qs) {

// something is wrong in this method call
server.get('checkauth', function (req, res, next) {
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
        var url = "https://solss.uow.edu.au/sid/sols_to_lms.call_main?" + qs.stringify({
            P_STUDENT_NUMBER: session.number,
            P_SESSION_ID: session.sid,
            p_cs: session.cs
        });
        request.get(url, function (error, resp, body) {
            INVALID_SESSION_STRINGS.forEach(function (v) {
                if (body.indexOf(v) !== -1) {
                    error = 401;
                    return false;
                }
            })
            if (error === 401) {
                session.destroy();
                res.send(401, 'Invalid session');
            } else if (error) {
                res.send(500, error);
            } else {
                res.send(200, body);
            }
        });
    });
    return next();
});

}
