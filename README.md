Install npm

Install make

For deploying in AWS from command line using aws command:
$ aws cloudformation deploy --template-file alarm.yml --stack-name alarm --capabilities CAPABILITY_NAMED_IAM
$ aws cloudformation deploy --template-file snsTopics.yaml --stack-name sns-topics --capabilities CAPABILITY_NAMED_IAM