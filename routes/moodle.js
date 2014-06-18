"use strict";
module.exports = function (server, db, sessCrypto, request, qs) {

// something is wrong in this method call
server.get('moodle', function (req, res, next) {
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
        var url = "https://solss.uow.edu.au/sid/sols_to_lms.do_lms_SSO?" + qs.stringify({
            p_student_number: session.number,
            p_session_id: session.sid,
            p_cs: session.cs
        });
        request.get(url, function (error, resp, body) {
            if (resp.statusCode === 200) {
                // A successful 'redirect' to moodle from sols is in the form of a 200 and '<HTML><HEAD><META HTTP-EQUIV="Refresh" CONTENT="0;URL=https://moodle.uowplatform.edu.au/login/index.php?auth=sso&ticket=abcd&time=1234"></HEAD><BODY></BODY></HTML>'
                var match = /URL=([0-9a-zA-Z:\/\.?=&]*)"/g.exec(body);
                if (match != null) {
                    var url = match[1];
                    res.header('Location', url);
                    res.send(303, 'Redirecting to <a href="' + url + '">Moodle</a>');
                } else {
                    res.send(500, body);
                }
            } else if (error) {
                res.send(500, error);
            } else if (((resp.statusCode / 100) | 0) === 3) {// 3xx
                res.send(200, { location: resp.headers.location });
            } else {
                body = body.replace(/href=\\"\/sid/g, 'href=\\"https://solss.uow.edu.au/sid');
                res.send(resp.statusCode, body);
            }
        });
        //res.header('Location', url);
        //res.send(302, 'Redirecting to <a href="' + url + '">' + url + '</a>'); 
    });
    return next();
});

}
