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

### **Answer**:

-   Change Log:
    -   fixed auth property in `client/config.json` 
    -   disabled the expressions [ramainder] and [subtraction] (in `client/config.json`). Those expressions were causing errors due to divisions by zero. The development team must check the client.randomExpression() implementation.

## Challenge 2. Development flow

The team is complaining that confusing to have lots of incomplete work commit to master and it's hard to track what code is in what environment.

Can you come up with a strategy to solve this issue?

### **Answer**:

_I would suggest the following branch strategy based on feature and release branches._

-  **Suggested Branches**:
    -   `master`:  a production snapshop (the source of truth)
    -   `develop`:  a copy of production + new features and bug fixes (it might represent the test environment)
    -   `release/*`: branches for supporting new releases (context isolation)
    -   `feature/*`: branches that will stand for new features or business requirements
    -   `bugfix/*`: branches that will be used for production support (bug fixing)

-  **When a project is starting...**:
    - 1. The team creates a `release` branch from master (`release/xyz`)
    - 2. Later on, the team creates a `feature` branch (`feature/xpto`) based on the `release` one created before
    - 3. A business requirement is commited into the `feature` branch.
    - 3. Since the development is done, the `feature` branch can be merged into the `release` branch
    - 4. The `release` branch, now contains a new `feature` and can now be merged to `develop` so the tester can check the `feature` implementation.

            (merging the `feature` branch into `develop` is also a valid option but, at the end, it should get merged into the `release` branch [for more flexibility on projects concurrency])
    
-   **When a bug shows up in production ...**
    - 5. The team creates a `bugfix` branch (`bugfix/fix`) based on `master` (copy of production)
    - 6. The bug fix is committed into the new `bugfix` branch and then merged to `develop` so the tester can make sure that the issue is fixed. 
    - 7. Since the tester gives the thumbs up, the `bugfix` branch can be merged to `master` 
    
            ( merging `develop` into `master` is also a valid option, but the team must be aware of new features in develop [waiting for the release] before the merging ).

```
    [feature/*]    /7-\\------\\-----------------\\
    [release/*]   /7-  \_------\_---\\---\\---\_--\\--\\
    [develop  ]  /7-        /7-------\_---\\-------\_--\\------>
    [master   ]  \-        //   /7---------\_-----------\_--->
    [bugfix/* ]   \_-----.//---//
```

## Challenge 3. Test the application before deployment

At KI, all our code needs to be properly tested. If you take a look to the services, you have a folder called test where we are doing some unit tests using mocha (https://mochajs.org/)

We need you to implement a CI system to test it.

Choose one system, travis-ci, gitlab-ci, circleci... whatever you want and make the necessary change to have a proper Git and CI flow.

### **Answer**:

For CI I've chosen bitbucket pipelines (just for the fun of it).

I've created a [bitbucket-pipeline.yml](bitbucket-pipeline.yml) file in the repository root that is going to build and push the container images into my docker hub account. https://hub.docker.com/u/jsoliveira


- **Master** _(CI and CD)_
    - https://bitbucket.org/jsoliveira/challenge-devops-master/addon/pipelines/home#!/results/1
- **Develop** _(CI and CD)_
    - https://bitbucket.org/jsoliveira/challenge-devops-master/addon/pipelines/home#!/results/2
- **Feature** _(CI)_
    - https://bitbucket.org/jsoliveira/challenge-devops-master/addon/pipelines/home#!/results/3


There are multiple pipelines in the yaml file:
1) one for CI/CD in test (develop branch)
2) one for CI/CD in prod (master master)
3) one for CI (any branch) so the developers can chose their own branch and release it thru a Pull Request

- Once a a branch is merged to develop or master the pipelines will push the containers into the container registry (CI) and the kustomization.yml of the K8s clusters is updated with the latest images built.

- FluxCD will see that the repository has changed and will apply the kubernetes workload definitions on the prod or dev cluster (more details down below)

## Challenge 4. Deploy it to kubernetes

At this point you should have a proper flow going. Now we need to deploy it!

Please create a script with whatever tools you which to deploy the app to a Kubernetes cluster.

## Answer
For this challenge I've created a new directory ([kubernetes](kubernetes/)) in the repository root.

The kubernetes directory is ready to be used as a separate repository and it contains all the K8s workloads definitions needed for deploying the micro services solution to a cluster.

Inside the [kubernetes](kubernetes/) dir there are different folders reprenting the different AKS clusters (dev and prod as just examples).

The Kustomization.yaml files will ensure that each cluster (environment) gets the suitable workload definitions.

- [kubernetes/aks01-dev/kustomization.yaml](kubernetes/aks01-dev/kustomization.yaml)

- [kubernetes/aks01-prod/kustomization.yaml](kubernetes/aks01-prod/kustomization.yaml)

_(The kustomization files above are updated by the pipelines for CD)_

**Deploying K8s workloads:**

```powershell

# DEV Cluster
kubectl kustomize kubernetes/aks01-dev | kubectl -apply -f -

# PROD Cluster
kubectl kustomize kubernetes/aks01-prod | kubectl -apply -f -
```

### **About the Workload definitions ...**

Instead of creating helm charts I've pereferd using simple templates taking the advantages of the kustomization tool.

The template can be found in the [kubernetes/services/.template](kubernetes/services/.template) directory.

There is a kustomization file for each service that will ensusre that the .template is properly inherited as well as each service get the specific configuration in order to be deployed separatedly
(whithout having to deploy the entire cluster)

**Deploying a single service**
```powershell
kubectl kustomize kubernetes/services/addition | kubectl -apply -f -
```


_As said before, FLuxCD was the candidate for making the CD happen_ 

_It is installed along with the infrastructure.(More details down below.)_

**Login into the cluster**
```powershell
# DEV Cluster
az aks get-credentials --admin --name aks01-dev-aks --resource-group aks01-cluster-dev-rg

# PROD Cluster
az aks get-credentials --admin --name aks01-prod-aks --resource-group aks01-cluster-prod-rg
```


![](docs/aks-k9s.png)
https://github.com/derailed/k9s

## Challenge 5: Create infrastructure

Now is the part that we will need you to deploy this system to the target infrastructure.

As a good cloud engineer you will do this in an automated and reproducible way, taking advantages of infrastructure as code solutions. We would prefer if you use a cloud agnostic solution target whatever cloud provider you prefer.

(note: since testing this solution may incur some costs, we will ignore errors that might come from not testing/running the script)

## Answer
For accomplishing this challenge I've chosen terraform + azure as cloud provider.

The infrastructure state (terraform state) has been stored in a private azure storage account (because of sensitive data). 

For this challenge I am assuming that high availability and extra security is not needed. 

The details of the infrastructure and AKS clusters setup can be found at [./infrastructure/main.tf](./infrastructure/main.tf).

### Booting up the infrastructure:

```powershell
# set the working directory
cd infrastructure

#set the access key for terraform remote backend (state)
$env:ARM_ACCESS_KEY="<azure storage account access key>"

# login into azure
az login

# install the terraform providers
terraform init

# boot up the infra
terraform apply -auto-approve
```

![](docs/azure.png)

### **Fetching AKS cluster credentials**

```powershell
# Production Cluster
az aks get-credentials --admin --name aks01-prod-aks --resource-group aks01-cluster-prod-rg

# Development Cluster
az aks get-credentials --admin --name aks01-dev-aks --resource-group aks01-cluster-dev-rg

```
### **Destroying the infra**

```powershell
terraform destroy -auto-approve
```

## Bonus

-   Update your CI to also do CD


## Answer

For the CD I've chosen FLuxCD. 

https://fluxcd.io/

FluxCD is installed along with the infrastuture (using terraform):
- [./infrastructure/main.tf](./infrastructure/main.tf)
- [./infrastructure/modules/fluxcd](./infrastructure/modules/fluxcd)

During the installation the K8s workloads definitions repository (bitbucket) is provided and configured in the cluster.

The FluxCD will be continuously looking for changes in the remote repository. 

When new commits arrive FLux will ensure that the sate of the cluster is properly applied.

I've created two clusters for prod and dev (just for the fun of it)
- [kubernetes/aks01-dev](kubernetes/aks01-dev)

- [kubernetes/aks01-prod](kubernetes/aks01-prod)

The bitbucket-pipelines is updating the clusters repository with the latest version of the containers built and FluxCD will sync the repo with the cluster (based on the branch)

_I could use the FluxCD controllers for image-automation, but I'd prefer to keep it simpler._