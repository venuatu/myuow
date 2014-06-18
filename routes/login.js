"use strict";
module.exports = function (server, db, sessCrypto, async, request, qs, restify) {

server.post('login', function (req, res, next) {
    var params = req.params;

    if (!(params.username && params.password)) {
        res.send(new restify.InvalidArgumentError("Missing username or password"));
        return next();
    }

    async.waterfall([
        function (next) {
            request.post('https://solss.uow.edu.au/sid/sols_logon.validate_sols_logon',
            { form: { p_username: params.username, p_password: params.password } }, function (error, resp, body) {
            if (!error && resp.statusCode == 302) {
                var loc = resp.headers.location;
                loc = loc.slice(loc.indexOf('?') + 1);
                var params = qs.parse(loc);
                next(null, {
                    number: params.p_student_number,
                    sid: params.p_session_id,
                    cs: -1
                }, resp.headers); 
            } else {
                next(body);
            }});
        }, function (value, headers, next) {
            db.db.query('delete from sessions where number = ' + value.number);
            request.get('https://solss.uow.edu.au/sid/' + headers.location, function (error, resp, body) {
                value.csmenu = /p_cs=([0-9a-zA-Z]*)/.exec(body)[1];
                var sess = db.Session.build(value);
                sess.save().success(function (session) {
                    next(null, session);
                });
            });
        }, function (sess, next) {
            request.get('https://solss.uow.edu.au/sid/sols_menu.display_sols_menu?p_system=STUDENT&p_menu_name=MAIN_MENU&' + qs.stringify({
                p_student_number: sess.number,
                p_session_id: sess.sid,
            }), function (error, res, body) {
                if (error) {
                    console.log('failed to get cs2: ', params.username, sess.number);
                } else {
                    var match = /p_cs=([0-9]*)/g.exec(body);
                    if (match != null) {
                        sess.cs = match[1];
                        sess = sess.save().success(function (session) {
                            next(null, session);
                        });
                    }
                }
            });
        }], function (err, result) {
            if (result) {
                res.send(201, sessCrypto.encrypt({ id: result.id }));
            } else if (typeof err === 'string') {
                var index = -1;
                if (err.indexOf('Invalid Username and Password') !== -1) {
                    res.send(403, "Invalid Username and/or Password");
                } else if ((index = err.indexOf('SOLS has been locked until')) !== -1) {
                    var lockout = /SOLS has been locked until ([^\<]*)/m.exec(err);// 11:54am 29-OCT-2013
                    res.send(429, 'Your account has been locked out of sols until ' + lockout[1]);
                } else {
                    res.send(500, "Something went wrong ... (maybe solsmail?)");
                    console.log('badlogin: ', params.username, res.statusCode, err.replace('\n', ''));
                }
            } else if (err.code && err.response) {
                res.send(err.code, err.response);
            } else if (err) {
                res.send(500, err);
            }
    });
    return next();
});


};
