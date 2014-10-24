# My UoW frontend 1.1.0

This project is live at: https://myuow.venuatu.me/

This is built with angularjs, bootstrap, angular-bootstrap, sass and traceur

## Requirements

compass (ruby, rubygems)
nodejs v0.10 (npm)

## Building

You should change the serverAddress constant in [[app/scripts/app.js]] to the place that hosts the data apis

~~~~~sh

gem install compass
npm install -g grunt-cli bower
git clone https://github.com/venuatu/myuow
cd myuow/data/
npm install
bower install
grunt server

# or build it with
grunt

~~~~~
