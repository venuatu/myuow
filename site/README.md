# My UoW frontend [semver](http://semver.org/) 1.0.0

This is built with angularjs, bootstrap, angular-bootstrap, 

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
