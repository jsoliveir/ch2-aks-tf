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
}

module "fluxcd_install" {
  source                 = "./modules/fluxcd"
  kubernetes = {
    host                   = module.aks01_cluster_dev.kube_config.host
    client_key             = module.aks01_cluster_dev.kube_config.client_key
    client_certificate     = module.aks01_cluster_dev.kube_config.client_certificate
    cluster_ca_certificate = module.aks01_cluster_dev.kube_config.cluster_ca_certificate
  }
  config = {
    repository = "https://bitbucket.org/jsoliveira/challenge-devops-master"
    repository_branch = "challenge/ch-4"
    repository_path = "kubernetes"
    namespace = "flux-system"
  }
}

# To be continued...

# module "azure_dns" {
#   source = "./modules/dnszones"
#   domain = "azure.jsoliveira.com"
#   environment = "dev"
#   a_records = [{
#     ttl = 3600
#     name = "aks01"
#     records = [ module.aks01_cluster_dev.ingress_ip ]
#   }]
# }
