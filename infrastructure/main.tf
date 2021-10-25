terraform {
   backend "azurerm" {
    storage_account_name = "storageaccountstate"
    container_name       = "terraform"
    key                  = "dev.terraform.tfstate"
    # set the storage access key in theARM_ACCESS_KEY (environment variable)
  }
}

module "aks01_cluster_dev" {
  source = "./modules/kubernetes"
  vm_size = "Standard_DS2_v2"
  location = "westeurope"
  cluster_name = "aks01"
  environment = "dev"
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
