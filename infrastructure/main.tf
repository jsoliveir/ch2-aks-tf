terraform {
   backend "azurerm" {
    storage_account_name = "jsoliveirastorageaccount"
    container_name       = "terraform"
    key                  = "dev.tamanna.terraform.tfstate"
    # set the storage access key in the ARM_ACCESS_KEY (environment variable)
  }
}

module "aks01_cluster_dev" {
  source = "./modules/kubernetes"
  vm_size = "Standard_DS2_v2"
  location = "westeurope"
  cluster_name = "aks01"
  environment = "dev"
  node_count = 2
}

module "fluxcd_install" {
  active                 =  true
  source                 = "./modules/fluxcd"
  kubernetes = {
    host                   = module.aks01_cluster_dev.kube_config.host
    client_key             = module.aks01_cluster_dev.kube_config.client_key
    client_certificate     = module.aks01_cluster_dev.kube_config.client_certificate
    cluster_ca_certificate = module.aks01_cluster_dev.kube_config.cluster_ca_certificate
  }
  config = {
    repository = "https://bitbucket.org/jsoliveira/challenge-devops-master"
    repository_branch = "master"
    repository_path = "kubernetes/aks01-dev"
    namespace = "flux-system"
  }
}

module "azure_dns" {
  source = "./modules/dnszones"
  domain = "azure.jsoliveira.com"
  environment = "dev"
  a_records = [{
    ttl = 3600
    name = "aks01"
    records = [ module.aks01_cluster_dev.ingress_ip ]
  }]
}


# To be continued...
## TODO: +1 AKS cluster for dev (in a different region) 
## TODO: +2 AKS clusters for prod (in different regions) 
## TODO: +2 virtual networks for the GWs
## TODO: +1 APPGATEWAY for the 2 dev clusters 
## TODO: +1 APPGATEWAY for the 2 prod clusters 
## TODO: +1 dnszone for dev 
## TODO: +1 dnszone for prod
## TODO: +1 frontdor for prod (depending on the customers region)
## TODO: make the AKS clusters private accesible thru a private network