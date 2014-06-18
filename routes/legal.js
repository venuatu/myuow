"use strict";
module.exports = function (server, db, fs, async, jsdom) {

server.checkLegal = function (body) {
    return /NAME="p_submit" VALUE="(I Understand|Continue)"/i.test(body) || /type="submit" value="(I Agree|Continue)"/i.test(body);
};

var cleanUpField = function (obj) {
    var str = obj.children[0].innerHTML.trim();
    str = str.replace(/<br[\s\/]*>/g, '\n');
    return str;
};

server.extractLegal = function (body, callback) {
    async.waterfall([
        function (next) {
            jsdom.env(body, [], function (errors, window) {
                next(null, window);
            });
        },
        function (window, next) {
            var trs = window.document.querySelectorAll('table table tr');
            var items = [];
            for (var i = 0; i +1 < trs.length; i += 2) {
                items.push({ 
                    title: cleanUpField(trs[i]).replace(/<\/?[a-zA-Z]+>/gi, ''),
                    content: cleanUpField(trs[i+1])
                });
            }
            window.close();
            next(null, items);
        }, function (items, next) {
            var regex = /ACTION\="([^"]+)"/i.exec(body);
            var obj = {
                next: regex[1],
                items: items,
                doc: body
            }
            if (/type="submit" value="I Agree"/i.test(body))
                obj.extra = 'p_db_session_id=';
            next(null, obj);
        }
    ], function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, result);
        }
    })
};

server.get('legal', function (req, res, next) {
    var body = fs.readFileSync('legal.html').toString().replace('script', 'strong');

    if (server.checkLegal(body)) {
        server.extractLegal(body, function (err, result) {
            if (err) {
                res.send(500, err);
            } else {
                res.send(200, result);
            }
        });
    } else {
        res.send(500, "This is not a legal page");
    }
    return next();
});

}
