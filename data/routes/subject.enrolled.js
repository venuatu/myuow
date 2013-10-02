"use strict";
module.exports = function (server, db, sessCrypto, request, qs, async, jsdom, foreach) {

server.get('subject/enrolled', function (req, res, next) {
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
                    return;
                }
                next(null, session);
            }).error(function () {
                next("database problems ...");
            });
        }, function (session, next) {
            var url = "https://solss.uow.edu.au/sid/timetable_student.call_main?" + qs.stringify({
                P_STUDENT_NUMBER: session.number,
                P_SESSION_ID: session.sid,
                p_cs: session.cs,
            });
            request.get(url, function (error, resp, body) {
                if (error) {
                    next(error);
                } else {
                    next(null, body)
                }
            });
        }, function (body, next) {
            jsdom.env(body, [], function (errors, w) {
                var courses = [];                
                foreach(w.document.querySelectorAll('td > a'), function (v, k) { 
                    var val = v.textContent;
                    courses.push(val);
                })
                w.close();
                next(null, courses);
            });
        }
    ], function (error, result) {
        if (result) {
            res.send(200, result);
        } else if (typeof error === 'string') {
            res.send(500, error);
        } else if (error === 401 || /Your session has timed out/g.test(body) || /Parameter Mismatch/g.test(body)) {
            res.send(401, "Session not found");
        } else {
            res.send(500, error);
        }
    });

    return next();
});

}
