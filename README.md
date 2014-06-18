# My UoW data [semver](http://semver.org/) 1.0.0

## Requirements

node.js v0.10.x (along with npm)

## Installation

~~~~~sh

git clone https://github.com/venuatu/myuow
cd myuow/data/
npm install
# change the configuration however you like (and generate your own key)
node server.js
# or 
npm install -g forever
forever start server.js

~~~~~

note: npm currently stops due to a cb() error just keep running the npm step until it properly finishes

## TODO

-   Work out the parameter combinations for the other sols pages
-   Scrape the other pages
-   Hide the menu items sols session values (this would require the above)
-   Replace `/yank` with something better
-   Verify the sols ssl certificates
-   Add any other data that should be available (suggest some by opening an issue)

## API

### POST /login

-   data: { username: '', password: '' }
-   returns a session token (base 64 string) to be used for the other APIs
-   note: The username and password are not stored after the request but if you don't trust me (you shouldn't) see [[routes/login.js]] and [[database.js]] and also run your own version of this server

### GET/checkauth?session=(session)

-   returns a 401 if the session is invalid / timed out

### GET /subject/:code

~~~~~json

curl https://uow.venuatu.me/api/subject/csci103 | underscore print
{
  "code": "CSCI103",
  "name": "Algorithms and Problem Solving",
  "year": "2013",
  "session": "Autumn",
  "campus": "Woll/On Campus/Class 1",
  "points": "6",
  "hours": "1x 1 hour lecture and 1x2 hour lecture + 1x 1 hour tutorial and 1x2 hour tutorial",
  "coordinators": ["Dr Angela Piper"],
  "lecturers": ["Dr Angela Piper"],
  "classes": {
    "Lecture A": [{ "day": "Mon", "start": "13:30", "finish": "15:30", "location": "20-3", "week": "AllWeeks" }],
    "Lecture B": [{ "day": "Wed", "start": "13:30", "finish": "14:30", "location": "20-2", "week": "AllWeeks" }],
    "Tutorial A": [
      { "day": "Mon", "start": "15:30", "finish": "17:30", "location": "3-121", "week": "Not first week" },
      { "day": "Tue", "start": "08:30", "finish": "10:30", "location": "24-103", "week": "Not first week" },
      { "day": "Tue", "start": "17:30", "finish": "19:30", "location": "3-121", "week": "Not first week" }
    ],
    "Tutorial B": [
      { "day": "Wed", "start": "14:30", "finish": "15:30", "location": "24-202", "week": "Not first week" },
      { "day": "Thu", "start": "10:30", "finish": "11:30", "location": "3-121", "week": "Not first week" },
      { "day": "Thu", "start": "16:30", "finish": "17:30", "location": "3-121", "week": "Not first week" }
    ]
  }
}
~~~~~

### GET /subject/enrolled?session=(session)

-   returns ['subj001', 'subj002', 'subj003', 'subj004']

### GET /yank?session=(session)&page=(page)&extra=(extra)

-   page should be https:///solss.uow.edu.au/sid/__page.whatever__
-   extra may contain extra parameters for the request
-   authLower provides a way to change the auth parameters to lowercase (as used by the main menu)

### GET /moodle?session=(session)

-   redirects to the moodle homepage 

### GET /menu?session=(session)

-   excerpt below (though the real one includes session ids)

~~~~~json

[
  {
    "title": "Main Menu",
    "links": [
      {
        "title": "eLearning",
        "link": "https://solss.uow.edu.au/sid/sols_to_lms.call_main"
      },
      {
        "title": "Assignment Results",
        "link": "https://solss.uow.edu.au/sid/Assignment_Result.call_main"
      }
    ]
  },
  {
    "title": "Timetable Menu",
    "links": [
      {
        "title": "Exam Timetable",
        "link": "https://solss.uow.edu.au/sid/er_exam_timetable.call_main"
      },
      {
        "title": "Subject Timetable",
        "link": "https://solss.uow.edu.au/sid/timetable_student.call_main"
      }
    ]
  }
]

~~~~~