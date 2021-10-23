terraform {
   backend "azurerm" {
    storage_account_name = "storageaccountstate"
    container_name       = "terraform"
    key                  = "dev.terraform.tfstate"
    # set the storage access key in ARM_ACCESS_KEY (environment variable)
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 2.82.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.7.0"
    }
    helm = {
      source = "hashicorp/helm"
      version = "~> 2.3.0"
    }
    kubernetes = {
      source = "hashicorp/kubernetes"
      version = "2.6.1"
    }
  }
}

provider "azurerm" {
  features {}
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
