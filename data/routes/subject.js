"use strict";
var SUBJECT_FIELDS = [
    'code',
    'name',
    'year',
    'session',
    'campus',
    'points',
    'staff',
    'hours'
];
var SUBJECT_TIME_FIELDS = [
    'activity',
    'day',
    'start',
    'finish',
    'location',
    'week'
];

module.exports = function (server, db, async, request, qs, jsdom, foreach, slice, extend) {

var extractText = function (nodelist) {
    var data = [];
    foreach(nodelist, function (v, k) {
        if ((k % 2) == 0)
            return;
        var text = v.textContent;
        var val = text != undefined ? text.trim() : '';
        if (val !== '') {
            data.push(val);
        }
    });
    //console.log('exttext: ->', data.length, JSON.stringify(data));
    return data;
};

db.db.sync().success(function () {
    db.db.query('delete from subjects');
});

server.get('subject/:code', function (req, res, next) {
    var params = req.params;
    if (!(params.code)) {
        res.send(new restify.InvalidArgumentError('Missing code'));
        return next();
    }
    params.code = params.code.toUpperCase();

    async.waterfall([
        function (next) {
            db.Subject.find({ where: {code: params.code}}).success(function (data) {
                if (data == null) {
                    next(null);
                    return;
                }
                res.send(200, JSON.parse(data.val));
                next(true);
            }).error(function () {
                next(500);
            })
        }, function (next) {// the form is on: https://solss.uow.edu.au/owa/sid/timetable_all.Call_main?p_campus_id=1&p_type=a
            request.post('https://solss.uow.edu.au/owa/sid/Timetable_All.Process_Search', { form: {
                p_subject_code: params.code,
                p_subject_name: '',
                p_subject_level: '-1',
                p_session: '-1',
                p_unit_abb: '-1',
                p_year: '2013',
                p_campus_id: '1',
                p_draft: '',
                p_publish_date: '27 Sep, 2013 12:55:46pm',
                p_type: 'a'
            }}, function (error, resp, body) {
                if (error) {
                    next(error);
                } else {
                    var match = /NAME="p_sub_instid_varray" VALUE="([0-9]*)"/g.exec(body);
                    if (match !== null) {
                        next(null, match[1])
                    } else {
                        next(404);
                    }
                }
            });
        }, function (val, next) {
            request({ method: 'POST',
                url: 'https://solss.uow.edu.au/owa/sid/Timetable_All.search_result_timetable', 
                headers: { 'Content-type': 'application/x-www-form-urlencoded' },
                body: qs.stringify({ 
                    p_year: 2013,
                    p_campus_id: 1,
                    p_draft: '',
                    p_publish_date: '27 Sep, 2013 12:55:46pm',
                    p_type: 'a',
                    p_sub_instid_varray: -1
                }) + '&p_sub_instid_varray=' + val
            }, function (error, resp, body) {
                if (error) {
                    next(error);
                } else if (/No subjects were found/m.test(body)) {
                    console.warn('subject result not found', params.code);
                } else {
                    next(null, body);
                }
            });
        }, function (body, next) {
            jsdom.env(body, [], function (errors, w) {
                var doc = w.document,
                    obj = {};

                var data = extractText(doc.querySelectorAll('table > tr')[2].childNodes);
                SUBJECT_FIELDS.forEach(function (v, k) {
                    //console.log('sfields: ', k, v);
                    var val = data[k];;
                    obj[v] = val;
                });

                var staff = obj.staff.replace(/\s{7}/g, '|').split('|');
                delete obj.staff;
                obj.coordinators = [];
                obj.lecturers = [];
                var arr = obj.coordinators;
                staff.forEach(function (v) {
                    if (v === 'Coordinator')
                        return;
                    var index = -1;
                    if ((index = v.indexOf('Lecturer')) !== -1) {
                        arr.push(v.replace('Lecturer', ''));
                        arr = obj.lecturers;
                    } else {
                        arr.push(v);
                    }
                });

                var classes = [];
                foreach(slice(doc.querySelectorAll('table table > tr'), 1), function (v, k) {
                    var time = {};
                    var data = extractText(v.childNodes);
                    if (data.length === SUBJECT_TIME_FIELDS.length + 1) {
                        data = slice(data, 1);// this row has a and or field
                    }
                    SUBJECT_TIME_FIELDS.forEach(function (vv, k) {
                        var val = data[k];
                        //console.log('stimef: ', vv, k, val);
                        time[vv] = val;
                    });
                    classes.push(time);
                });
                obj.classes = {};
                var curr = -1;
                classes.forEach(function (v, k) {
                    //console.log(curr, v);
                    if (!obj.classes[v.activity]) {
                        obj.classes[v.activity] = [];
                    }
                    obj.classes[v.activity].push(v);
                    delete v.activity;
                });
                //obj.coordinators = 
                w.close();
                next(null, obj);
            });
        }], function (error, result) {
            if (result) {
                var subject = db.Subject.build({ code: params.code, val: JSON.stringify(result) });
                subject.save();
                res.send(200, result);
            } else if (error === 404) {
                res.send(404, "Subject not found");
            } else if (typeof error === 'string') {
                res.send(500, error);
            } else if (error !== true) {
                res.send(500, error);
            }
    });
    return next();
});

}