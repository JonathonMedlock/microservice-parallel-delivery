# microservice-parallel-delivery
Project for demonstrating an implementation of the event-driven architecture pattern. Contains a mediator service and an individual event processor. Project is both very bare-bones and not optimized, and is simply intended as an example.

Each folder is for a specific lambda function that is created by standing up a stack using the respective CloudFormation template. 
These functions are added to a zip file (also included here), and uploaded to an S3 bucket that the template points to when deploying 
the lambda. When deploying stacks, the governor (event mediator that records all messages that pass through the overall system) must
be deployed first. The name of the governor is used when deploying the other microservices that are utilizing the event delivery system 
associated with that governor.

The templates in this project are currently configured to be utilized via the AWS console or cli.

The SQS for the project is set up to use long polling at an interval of 20 seconds. This is mostly to cut down on empty receives and
avoid bloat in the number of poll requests made by multiple queues.

