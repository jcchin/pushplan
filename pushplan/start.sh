#!bin/bash

#APP_ENV="production"
#APP_ENV="local"
#APP_ENV="dev"

printf "Start PushPlan in? (local[l], dev[d], or production[p]): "

read APP_ENV

#local
if [ "$APP_ENV" = "local" ]; then
    echo "Deploying PushPlan to localhost"
    meteor --settings config/local/settings.json
elif [ "$APP_ENV" = "l" ]; then
    echo "Deploying PushPlan to localhost"
    meteor --settings config/local/settings.json
#dev
elif [ "$APP_ENV" = "dev" ]; then
    echo "Deploying PushPlan to to dev (pushplan.meteor.com)"
    meteor deploy pushplan.meteor.com --settings config/development/settings.
elif [ "$APP_ENV" = "d" ]; then
    echo "Deploying PushPlan to dev (pushplan.meteor.com)"
    meteor deploy pushplan.meteor.com --settings config/development/settings.json
#production
elif [ "$APP_ENV" = "production" ]; then
    echo "Deploying PushPlan to production (pushplan.net)"
    meteor deploy pushplan.net --settings config/production/settings.json
    elif [ "$APP_ENV" = "p" ]; then
    echo "Deploying PushPlan to production (pushplan.net)"
    meteor deploy pushplan.net --settings config/production/settings.json

else
    echo "Invalid option"
fi