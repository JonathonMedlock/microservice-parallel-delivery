# microservice-parallel-delivery
Project for demonstrating an implementation of the event-driven architecture pattern. Contains a mediator service and an individual event processor. Project is both very bare-bones and not optimized, and is simply intended as an example.

The current governor receives all SNS messages into an SQS, checks its database to see if the sender is trusted, then if it is, stores the 
message and broadcasts the an approved message to the SNS to be picked up by the clients. The current client receives SNS messages into an 
SQS, checks if they are of topics that the client is listening to, then if they are, saves the message. There is no way currently to 
change the subscribed topics via user interface. This is meant to model the way that messages can be delivered asynchronously to multiple 
microservices that lets clients process these messages in parallel in customizable ways.

Each folder is for a specific lambda function that is created by standing up a stack using the respective CloudFormation template. 
These functions are added to a zip file (also included here), and uploaded to an S3 bucket that the template points to when deploying 
the lambda. When deploying stacks, the governor (event mediator that records all messages that pass through the overall system) must
be deployed first. The name of the governor is used when deploying the other microservices that are utilizing the event delivery system 
associated with that governor.

The APIs in the CloudFormation require manual deployment (could be configured to automatic).

The templates in this project are currently configured to be utilized via the AWS console or cli.

The SQS for the project is set up to use long polling at an interval of 20 seconds. This is mostly to cut down on empty receives and
avoid bloat in the number of poll requests made by multiple queues.

The FrontEnd folder contains the React project that was used to build the web page to be displayed. It can be run and built as any other
React project. The resulting build is hosted in an S3 bucket that is configured by the CloudFormation. 

The project is currently deployed on my AWS account and the front end can be reached at the following URLs (each microservice is entirely 
separated from the others).

Governor: http://gov-web-access.s3-website.us-east-2.amazonaws.com
Client 1: http://ms-cli-1-web-access.s3-website.us-east-2.amazonaws.com
Client 2: http://ms-cli-2-web-access.s3-website.us-east-2.amazonaws.com
Client 3: http://ms-cli-3-web-access.s3-website.us-east-2.amazonaws.com

These governor and clients each have information on the messages that can be sent and received by each.
