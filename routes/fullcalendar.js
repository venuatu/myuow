"use strict";
module.exports = function (server, db, config, async, restify, foreach, oforeach, crypto, moment) {

server.get('fullcalendar', function (req, res, next) {
    var params = req.params;
    if (!(params.subjects)) {
        res.send(new restify.InvalidArgumentError('Missing subjects'));
        return next();
    }
    var subjects = params.subjects.toUpperCase().split(',');

    var client = restify.createJsonClient({ url: 'http://' + config.address + ':' + config.port });
    async.map(subjects, function (subj, next) {
        client.get('/subject/' + subj, function (err, req, res, obj) {
            if (err) {
                next(err);
            } else {
                var data = [],
                    hash = crypto.createHash('md5');
                hash.update(obj.code + obj.name + obj.coordinators.join(''));
                var colour = '#' + (parseInt(hash.digest('hex').slice(0, 6), 16) & 0xcccccc).toString(16);

                oforeach(obj.classes, function (classlist, name) {
                    var title = obj.code + '\n' + name;
                    oforeach(classlist, function (item) {

                        var start = moment().day(item.day).hours(/(\d{1,2}):/.exec(item.start)[1]).minutes(/:(\d{2})/.exec(item.start)[1]).seconds(0).toString(),
                            end = moment().day(item.day).hours(/(\d{1,2}):/.exec(item.finish)[1]).minutes(/:(\d{2})/.exec(item.finish)[1]).seconds(0).toString();
                        data.push({
                            title: title + " " + item.location,
                            start: start.toString(),
                            end: end.toString(),
                            color: colour,
                            allDay: false
                        });
                    });
                });
                next(null, data);
            }
        });
    }, function (err, result) {
        if (err) {
            res.send(500, err);
        } else {
            var data = [];
            foreach(result, function (v) {
                foreach(v, function(item) {
                    data.push(item);
                });
            });
            res.send(200, data);
        }
    });
    return next();
});

};
