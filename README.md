# Cloud engineer challenge

Welcome to the Tamanna's DevOps challenge.
We want to feel your "devops" skiils!

## Calculator application

The calculator application uses a micro service architecture to provide an API to resolve mathematical expressions.

The calculator API exposes a single endpoint, a `POST` method on the `/` root url.
This endpoint receives an expression in the form of JSON:

Expression example:

```
curl -XPOST -H 'Authentication: Bearer binary-example' -H 'Content-Type: application/json' localhost:3000/ -d '{
    "type": "addition",
    "left": 6,
    "right": 1
}'
```

Expressions can be nested:

```
curl -XPOST -H 'Authentication: Bearer nested-example' -H 'Content-Type: application/json' localhost:3000/ -d '{
    "type": "addition",
    "left": {
       "type": "addition",
       "left": 6,
       "right": 1
    },
    "right": {
        "type": "subtraction",
        "left": {
            "type": "addition",
            "left": 6,
            "right": 1
        },
        "right": 1
    }
}'
```

The `calculator` micro service is the gateway where all calculator requests should be done.
The `calculator` service does not solve any expression by it self, it relies on a set of micro services to solve expressions.
There is one micro service per expression, all micro services only expose one endpoint, a `POST` method on the `/` root url and they expect an JSON expression with a numeric `left` and `right` operands.
The `calculator` service is responsible for navigating the expression nodes in such a way that it only calls the expression micro services only with number parameters.

The available mathematical expression micro services are:

-   `addition`:
    Returns a value object with the result of adding both operands.
-   `subtraction`:
    Returns a value object with the result of subtracting the `right` operand from the `left` one.
-   `multiplication`:
    Returns a value object with the result of multiplying both operands.
-   `division`:
    Returns a value object with the result of dividing the `left` by the `right` operand.
-   `remainder`:
    Returns a value object with the result of the remainder of dividing the `left` by the `right` operand.

**Note**:
"kilabs/cloud-engineer-challenge-calculator:latest" image is build from services/base/dockerfile

## Challenge 1. Debug skills

In the root of the project you have a docker-compose that brings all services up.
As you may notice the client service is not working properly and is throwing an error.

We need you to fix it!

## Challenge 2. Development flow

The team is complaining that confusing to have lots of incomplete work commit to master and it's hard to track what code is in what environment.

Can you come up with a strategy to solve this issue?

## Challenge 3. Test the application before deployment

At KI, all our code needs to be properly tested. If you take a look to the services, you have a folder called test where we are doing some unit tests using mocha (https://mochajs.org/)

We need you to implement a CI system to test it.

Choose one system, travis-ci, gitlab-ci, circleci... whatever you want and make the necessary change to have a proper Git and CI flow.

## Challenge 4. Deploy it to kubernetes

At this point you should have a proper flow going. Now we need to deploy it!

Please create a script with whatever tools you which to deploy the app to a Kubernetes cluster.

## Challenge 5: Create infrastructure

Now is the part that we will need you to deploy this system to the target infrastructure.

As a good cloud engineer you will do this in an automated and reproducible way, taking advantages of infrastructure as code solutions. We would prefer if you use a cloud agnostic solution target whatever cloud provider you prefer.

(note: since testing this solution may incur some costs, we will ignore errors that might come from not testing/running the script)

## Bonus

-   Update your CI to also do CD
